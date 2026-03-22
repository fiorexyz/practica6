"use client";

import { cancelarReserva } from "@/app/actions/reservas";
import { useState } from "react";
import { botonPeligro } from "@/lib/estilos";

export function BotonCancelarReserva({ id }: { id: number }) {
	const [error, setError] = useState<string | null>(null);

	async function manejarClick() {
		const resultado = await cancelarReserva(id);
		if (!resultado.exito) {
			setError(resultado.mensaje ?? "Error desconocido.");
		}
	}

	return (
		<div className="text-right shrink-0 ml-4">
			<button onClick={manejarClick} className={botonPeligro}>
				Cancelar
			</button>
			{error && <p className="text-xs text-red-400 mt-1">{error}</p>}
		</div>
	);
}
