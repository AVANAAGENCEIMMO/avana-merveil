document.addEventListener("DOMContentLoaded", function () {

    const phoneNumber = "261347747557";

    /* Dates déjà réservées */
    const reservedDates = {
        1: [
            { from: "2026-01-22", to: "2026-01-25" }
        ],
        2: [
            { from: "2026-02-22", to: "2026-02-25" }
        ]
    };

    document.querySelectorAll(".calendarWidget").forEach(input => {

        const bienId = input.dataset.bien;
        const container = input.closest(".details");
        const result = container.querySelector(".result");

        let reserveBtn = container.querySelector(".reserveBtn");

        // Créer le bouton si absent
        if (!reserveBtn) {
            reserveBtn = document.createElement("button");
            reserveBtn.className = "reserveBtn";
            reserveBtn.textContent = "📲 Réserver via WhatsApp";
            reserveBtn.style.display = "none";
            container.appendChild(reserveBtn);
        }

        flatpickr(input, {
            locale: "fr",
            mode: "range",
            dateFormat: "Y-m-d",
            minDate: "today",
            showMonths: 1,
            disable: [],

            onClose(selectedDates) {

                if (selectedDates.length !== 2) {
                    result.textContent = "";
                    reserveBtn.style.display = "none";
                    return;
                }

                const checkin = selectedDates[0];
                const checkout = selectedDates[1];

                let disponible = true;
                let conflit = null;

                // Vérification conflit
                (reservedDates[bienId] || []).forEach(res => {
                    const from = new Date(res.from);
                    const to = new Date(res.to);

                    if (checkin < to && checkout > from) {
                        disponible = false;
                        conflit = res;
                    }
                });

                if (disponible) {

                    result.style.color = "green";
                    result.textContent =
                        "✅ Disponible – Vous pouvez réserver ou appeler 034 77 475 57";

                    reserveBtn.style.display = "block";

                    reserveBtn.onclick = () => {
                        const message =
                            `Bonjour AVANA,%0A` +
                            `Je souhaite réserver le bien ${bienId}%0A` +
                            `Du ${checkin.toISOString().split("T")[0]} ` +
                            `au ${checkout.toISOString().split("T")[0]}.`;

                        window.open(
                            `https://wa.me/${phoneNumber}?text=${message}`,
                            "_blank"
                        );
                    };

                } else {

                    result.style.color = "red";

                    if (conflit) {
                        result.textContent =
                            `❌ Déjà réservé du ${conflit.from} jusqu'au ${conflit.to}`;
                    } else {
                        result.textContent =
                            "❌ Déjà réservé pour ces dates.";
                    }

                    reserveBtn.style.display = "none";
                }
            }
        });
    });
});
