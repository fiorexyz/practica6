import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BotonCancelarReserva } from "./boton-eliminar";
import { BotonConfirmarReserva } from "./boton-confirmar";
import { tarjeta } from "@/lib/estilos";

type EstadoReserva = "pendiente" | "confirmada" | "cancelada";

type PropiedadesPagina = {
	searchParams: Promise<{ estado?: string }>;
};

const etiquetaEstado: Record<string, string> = {
	pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
	confirmada: "bg-green-50 text-green-700 border-green-200",
	cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function PaginaReservas({ searchParams }: PropiedadesPagina) {
	const { estado } = await searchParams;
	const estadosValidos: EstadoReserva[] = ["pendiente", "confirmada", "cancelada"];
	const estadoSeleccionado = estadosValidos.includes(estado as EstadoReserva)
		? (estado as EstadoReserva)
		: undefined;

	const reservas = await prisma.reserva.findMany({
		where: estadoSeleccionado ? { estado: estadoSeleccionado } : undefined,
		orderBy: { fecha: "asc" },
		include: { servicio: true },
	});

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-xl font-semibold">Reservas</h1>
				<Link
					href="/reservas/nueva"
					className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
				>
					Nueva reserva
				</Link>
			</div>

			<div className="flex items-center gap-2 mb-5 text-sm">
				<Link
					href="/reservas"
					className={`px-2.5 py-1 rounded border ${
						!estadoSeleccionado
							? "bg-black text-white border-black"
							: "text-gray-600 border-gray-300 hover:bg-gray-50"
					}`}
				>
					Todos
				</Link>
				<Link
					href="/reservas?estado=pendiente"
					className={`px-2.5 py-1 rounded border ${
						estadoSeleccionado === "pendiente"
							? "bg-yellow-100 text-yellow-800 border-yellow-300"
							: "text-gray-600 border-gray-300 hover:bg-gray-50"
					}`}
				>
					Pendiente
				</Link>
				<Link
					href="/reservas?estado=confirmada"
					className={`px-2.5 py-1 rounded border ${
						estadoSeleccionado === "confirmada"
							? "bg-green-100 text-green-800 border-green-300"
							: "text-gray-600 border-gray-300 hover:bg-gray-50"
					}`}
				>
					Confirmada
				</Link>
				<Link
					href="/reservas?estado=cancelada"
					className={`px-2.5 py-1 rounded border ${
						estadoSeleccionado === "cancelada"
							? "bg-gray-200 text-gray-700 border-gray-300"
							: "text-gray-600 border-gray-300 hover:bg-gray-50"
					}`}
				>
					Cancelada
				</Link>
			</div>

			{reservas.length === 0 ? (
				<p className="text-sm text-gray-400">No hay reservas registradas.</p>
			) : (
				<ul className="space-y-3">
					{reservas.map((reserva) => (
						<li
							key={reserva.id}
							className={`${tarjeta} flex items-start justify-between`}
						>
							<div>
								<p className="font-medium text-sm">{reserva.nombre}</p>
								<p className="text-xs text-gray-400 mt-0.5">{reserva.correo}</p>
								<p className="text-xs text-gray-500 mt-1">
									{reserva.servicio.nombre} - {" "}
									{new Date(reserva.fecha).toLocaleString("es-SV")}
								</p>
								<span
									className={`inline-block mt-2 text-xs px-2 py-0.5 rounded border ${
										etiquetaEstado[reserva.estado] ?? etiquetaEstado.pendiente
									}`}
								>
									{reserva.estado}
								</span>
							</div>
							<div className="flex items-center">
								{reserva.estado === "pendiente" && (
									<BotonConfirmarReserva id={reserva.id} />
								)}
								{reserva.estado !== "cancelada" && (
									<BotonCancelarReserva id={reserva.id} />
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
