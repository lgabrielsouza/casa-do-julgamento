const form = document.getElementById("registrationForm");
const type = document.getElementById("type");
const serviceAreaWrapper = document.getElementById("serviceAreaWrapper");
const serviceArea = document.getElementById("serviceArea");
const feedback = document.getElementById("feedback");

type.addEventListener("change", () => {
    const isStaff = type.value === "STAFF";
    serviceAreaWrapper.hidden = !isStaff;
    serviceArea.required = isStaff;
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    feedback.className = "feedback";
    feedback.textContent = "";

    const payload = {
        eventId: Number(document.getElementById("eventId").value),
        eventSessionId: Number(document.getElementById("eventSessionId").value),
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        cpf: document.getElementById("cpf").value.replace(/\D/g, ""),
        phone: document.getElementById("phone").value.trim(),
        type: type.value,
        serviceArea: type.value === "STAFF" ? serviceArea.value.trim() : null
    };

    try {
        const response = await fetch("/api/registrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Não foi possível concluir a inscrição.");
        }

        feedback.className = "feedback success";
        feedback.innerHTML = `
            <strong>Inscrição confirmada!</strong><br>
            Participante: ${data.fullName}<br>
            Token do ingresso: ${data.qrToken}
        `;

        form.reset();
        serviceAreaWrapper.hidden = true;
    } catch (error) {
        feedback.className = "feedback error";
        feedback.textContent = error.message;
    }
});
