import React, { useState } from "react";

export default function FormationWeek({ week }) {
  const [showSessions, setShowSessions] = useState(false);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-indigo-200">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-indigo-700">
          Semaine {week.weekNumber}
        </h2>
        <button
          onClick={() => setShowSessions(!showSessions)}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {showSessions ? "Masquer les séances" : "Afficher les séances"}
        </button>
      </div>

      {showSessions && (
        <div className="text-gray-700">
          <p>Nombre de séances prévues : <span className="font-bold">{week.sessions}</span></p>
          {/* Ici tu peux détailler ou ajouter les séances par exemple */}
        </div>
      )}
    </div>
  );
}
