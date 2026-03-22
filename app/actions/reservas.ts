"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const EsquemaReserva = z.object({
	nombre: z.string().min(1, "El nombre es obligatorio."),
	correo: z.string().email("El correo no es valido."),
	fecha: z.string().min(1, "La fecha es obligatoria."),
	servicioId: z.coerce.number({ message: "Debe seleccionar un servicio." }),
});

function leerValoresReserva(formData: FormData) {
	return {
		nombre: String(formData.get("nombre") ?? ""),
		correo: String(formData.get("correo") ?? ""),
		fecha: String(formData.get("fecha") ?? ""),
		servicioId: String(formData.get("servicioId") ?? ""),
	};
}

export async function crearReserva(_estadoPrevio: any, formData: FormData) {
	const valores = leerValoresReserva(formData);

	const campos = EsquemaReserva.safeParse({
		nombre: valores.nombre,
		correo: valores.correo,
		fecha: valores.fecha,
		servicioId: valores.servicioId,
	});

	if (!campos.success) {
		return {
			errores: campos.error.flatten().fieldErrors,
			mensaje: "Error de validacion.",
			valores,
		};
	}

	const fechaInicio = new Date(campos.data.fecha);
	if (Number.isNaN(fechaInicio.getTime())) {
		return {
			errores: { fecha: ["La fecha no es valida."] },
			mensaje: "Error de validacion.",
			valores,
		};
	}

	const servicio = await prisma.servicio.findUnique({
		where: { id: campos.data.servicioId },
		select: { id: true, duracion: true },
	});

	if (!servicio) {
		return {
			errores: { servicioId: ["El servicio seleccionado no existe."] },
			mensaje: "Error de validacion.",
			valores,
		};
	}

	const duracionMs = servicio.duracion * 60 * 1000;
	const fechaFin = new Date(fechaInicio.getTime() + duracionMs);
	// Si una reserva existente empieza en (fechaInicio - duracion, fechaFin),
	// entonces se cruza con la nueva reserva.
	const inicioVentanaConflicto = new Date(fechaInicio.getTime() - duracionMs);

	const conflicto = await prisma.reserva.findFirst({
		where: {
			servicioId: servicio.id,
			estado: { not: "cancelada" },
			fecha: {
				gt: inicioVentanaConflicto,
				lt: fechaFin,
			},
		},
		select: { id: true },
	});

	if (conflicto) {
		return {
			errores: {
				fecha: ["Ese horario no esta disponible para el servicio seleccionado."],
			},
			mensaje: "Horario no disponible.",
			valores,
		};
	}

	await prisma.reserva.create({
		data: {
			nombre: campos.data.nombre,
			correo: campos.data.correo,
			fecha: fechaInicio,
			servicioId: servicio.id,
		},
	});

	revalidatePath("/reservas");
	redirect("/reservas");
	
}

export async function cancelarReserva(id: number) {
	try {
		await prisma.reserva.update({
			where: { id },
			data: { estado: "cancelada" },
		});
		revalidatePath("/reservas");
		return { exito: true };
	} catch {
		return { exito: false, mensaje: "No se pudo cancelar la reserva." };
	}
}

export async function confirmarReserva(id: number) {
	try {
		const resultado = await prisma.reserva.updateMany({
			where: { id, estado: "pendiente" },
			data: { estado: "confirmada" },
		});

		if (resultado.count === 0) {
			return {
				exito: false,
				mensaje: "Solo se pueden confirmar reservas pendientes.",
			};
		}

		revalidatePath("/reservas");
		return { exito: true };
	} catch {
		return { exito: false, mensaje: "No se pudo confirmar la reserva." };
	}
}
