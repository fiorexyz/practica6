"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { crearReserva } from "@/app/actions/reservas";
import { input, label, botonPrimario } from "@/lib/estilos";
import type { Servicio } from "@prisma/client";

type EstadoFormularioReserva = {
	errores: Record<string, string[]>;
	mensaje: string;
	valores: {
		nombre: string;
		correo: string;
		fecha: string;
		servicioId: string;
	};
};

const estadoInicial: EstadoFormularioReserva = {
	errores: {},
	mensaje: "",
	valores: {
		nombre: "",
		correo: "",
		fecha: "",
		servicioId: "",
	},
};

function BotonEnviar() {
	const { pending } = useFormStatus();
	return (
		<button type="submit" disabled={pending} className={botonPrimario}>
			{pending ? "Guardando..." : "Confirmar reserva"}
		</button>
	);
}

export function FormularioReserva({ servicios }: { servicios: Servicio[] }) {
	const [estado, accion] = useActionState(crearReserva, estadoInicial);

	return (
		<form action={accion} className="space-y-5">
			<div>
				<label className={label}>Nombre</label>
				<input
					name="nombre"
					type="text"
					className={input}
					defaultValue={estado.valores.nombre}
				/>
				{estado.errores?.nombre && (
					<p className="text-xs text-red-500 mt-1">{estado.errores.nombre}</p>
				)}
			</div>

			<div>
				<label className={label}>Correo</label>
				<input
					name="correo"
					type="email"
					className={input}
					defaultValue={estado.valores.correo}
				/>
				{estado.errores?.correo && (
					<p className="text-xs text-red-500 mt-1">{estado.errores.correo}</p>
				)}
			</div>

			<div>
				<label className={label}>Fecha y hora</label>
				<input
					name="fecha"
					type="datetime-local"
					className={input}
					defaultValue={estado.valores.fecha}
				/>
				{estado.errores?.fecha && (
					<p className="text-xs text-red-500 mt-1">{estado.errores.fecha}</p>
				)}
			</div>

			<div>
				<label className={label}>Servicio</label>
				<select
					name="servicioId"
					className={input}
					defaultValue={estado.valores.servicioId}
				>
					<option value="">Seleccione un servicio</option>
					{servicios.map((s) => (
						<option key={s.id} value={s.id}>
							{s.nombre} ({s.duracion} min)
						</option>
					))}
				</select>
				{estado.errores?.servicioId && (
					<p className="text-xs text-red-500 mt-1">
						{estado.errores.servicioId}
					</p>
				)}
			</div>

			<BotonEnviar />
		</form>
	);
}
