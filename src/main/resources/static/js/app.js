const form = document.getElementById("registrationForm");
const type = document.getElementById("type");
const serviceAreaWrapper = document.getElementById("serviceAreaWrapper");
const serviceArea = document.getElementById("serviceArea");
const feedback = document.getElementById("feedback");

function updateServiceAreaVisibility() {
    const isStaff = type.value === "STAFF";

    serviceAreaWrapper.hidden = !isStaff;
    serviceArea.required = isStaff;

    if (!isStaff) {
        serviceArea.value = "";
    }
}

type.addEventListener("change", updateServiceAreaVisibility);

updateServiceAreaVisibility();

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    feedback.className = "feedback";
    feedback.textContent = "";

    const payload = {
        eventId: Number(document.getElementById("eventId").value),
        eventSessionId: Number(
            document.getElementById("eventSessionId").value
        ),
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        cpf: document
            .getElementById("cpf")
            .value
            .replace(/\D/g, ""),
        phone: document.getElementById("phone").value.trim(),
        type: type.value,
        serviceArea:
            type.value === "STAFF"
                ? serviceArea.value.trim()
                : null
    };

    try {
        const response = await fetch("/api/registrations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Não foi possível concluir a inscrição."
            );
        }

        feedback.className = "feedback success";

        feedback.innerHTML = `
            <strong>Inscrição confirmada!</strong>
            <br><br>

            Participante: ${data.fullName}

            <div class="ticket">
                <h3>Seu ingresso</h3>

                <img
                    src="/api/tickets/qr/${data.qrToken}"
                    alt="QR Code do ingresso"
                    width="220"
                    height="220"
                >

                <p>Apresente este QR Code na entrada do evento.</p>

                <p class="ticket-token">
                    ${data.qrToken}
                </p>
            </div>
        `;

        form.reset();
        updateServiceAreaVisibility();

    } catch (error) {
        console.error(error);

        feedback.className = "feedback error";
        feedback.textContent = error.message;
    }
});