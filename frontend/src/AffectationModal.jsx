// AffectationModal.jsx
import React, { useState } from "react";

export default function AffectationModal({
  formation,
  formateurs,
  salles,
  onClose,
  onSave,
}) {
  // Cloner les séances locales pour édition
  const [seances, setSeances] = useState([...formation.seances]);

  // Ajouter une séance vide (date obligatoire)
  const addSeance = () => {
    const newId =
      seances.length > 0 ? Math.max(...seances.map((s) => s.id)) + 1 : 1;
    setSeances([
      ...seances,
      { id: newId, date: "", formateurId: null, salleId: null },
    ]);
  };

  // Supprimer séance
  const removeSeance = (id) => {
    setSeances(seances.filter((s) => s.id !== id));
  };

  // Modifier séance
  const updateSeance = (id, field, value) => {
    setSeances(
      seances.map((s) =>
        s.id === id
          ? {
              ...s,
              [field]: field === "date" ? value : value === "" ? null : value,
            }
          : s
      )
    );
  };

  // Vérifier conflits simples (formateur/salle déjà pris sur la même date)
  const checkConflict = (seance) => {
    return seances.some((s) => {
      if (s.id === seance.id) return false;
      if (s.date !== seance.date) return false;
      return (
        (seance.formateurId && seance.formateurId === s.formateurId) ||
        (seance.salleId && seance.salleId === s.salleId)
      );
    });
  };

  // Valider avant sauvegarde : toutes les séances doivent avoir une date
  const canSave = seances.every((s) => s.date) && seances.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-16 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">
          Gérer les séances pour : {formation.name}
        </h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
          aria-label="Fermer"
        >
          ×
        </button>

        <div>
          <button
            onClick={addSeance}
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            + Ajouter séance
          </button>
        </div>

        {seances.length === 0 && (
          <p className="italic text-gray-500">Aucune séance programmée.</p>
        )}

        <div className="space-y-4">
          {seances.map((s) => {
            const hasConflict = checkConflict(s);
            return (
              <div
                key={s.id}
                className={`flex flex-wrap gap-4 items-center border p-4 rounded-lg ${
                  hasConflict ? "bg-red-100 border-red-400" : "bg-gray-50"
                }`}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date séance
                  </label>
                  <input
                    type="date"
                    value={s.date}
                    onChange={(e) =>
                      updateSeance(s.id, "date", e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Formateur
                  </label>
                  <select
                    value={s.formateurId || ""}
                    onChange={(e) =>
                      updateSeance(
                        s.id,
                        "formateurId",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="border rounded px-2 py-1 min-w-[140px]"
                  >
                    <option value="">-- Choisir --</option>
                    {formateurs.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salle
                  </label>
                  <select
                    value={s.salleId || ""}
                    onChange={(e) =>
                      updateSeance(
                        s.id,
                        "salleId",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="border rounded px-2 py-1 min-w-[120px]"
                  >
                    <option value="">-- Choisir --</option>
                    {salles.map((sal) => (
                      <option key={sal.id} value={sal.id}>
                        {sal.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => removeSeance(s.id)}
                  className="text-red-600 font-bold text-xl self-end"
                  title="Supprimer séance"
                  aria-label="Supprimer séance"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {seances.some(checkConflict) && (
          <p className="mt-4 text-red-600 font-semibold">
            ⚠️ Conflit détecté : un formateur ou une salle est affecté deux fois
            le même jour.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            disabled={!canSave || seances.some(checkConflict)}
            onClick={() => onSave(seances)}
            className={`px-4 py-2 rounded text-white ${
              canSave && !seances.some(checkConflict)
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
