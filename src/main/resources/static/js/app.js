const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const navigation =
    document.getElementById(
        "navigation"
    );


menuToggle.addEventListener(
    "click",
    () => {

        const isOpen =
            navigation.classList.toggle(
                "open"
            );

        document.body
            .classList
            .toggle(
                "menu-open",
                isOpen
            );

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen
        );

        menuToggle.textContent =
            isOpen
                ? "✕"
                : "☰";
    }
);


navigation
    .querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navigation
                    .classList
                    .remove("open");

                document.body
                    .classList
                    .remove(
                        "menu-open"
                    );

                menuToggle
                    .setAttribute(
                        "aria-expanded",
                        "false"
                    );

                menuToggle.textContent =
                    "☰";
            }
        );

    });


/* CONTADOR */


const eventDate =
    new Date(
        "2026-10-29T18:00:00-03:00"
    );


const daysElement =
    document.getElementById(
        "days"
    );

const hoursElement =
    document.getElementById(
        "hours"
    );

const minutesElement =
    document.getElementById(
        "minutes"
    );

const secondsElement =
    document.getElementById(
        "seconds"
    );


function formatNumber(
    value
) {

    return String(value)
        .padStart(
            2,
            "0"
        );
}


function updateCountdown() {

    const now =
        new Date();

    const difference =
        eventDate - now;


    if (
        difference <= 0
    ) {

        daysElement.textContent =
            "00";

        hoursElement.textContent =
            "00";

        minutesElement.textContent =
            "00";

        secondsElement.textContent =
            "00";

        return;
    }


    const days =
        Math.floor(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    const hours =
        Math.floor(
            (
                difference /
                (
                    1000 *
                    60 *
                    60
                )
            ) % 24
        );


    const minutes =
        Math.floor(
            (
                difference /
                (
                    1000 *
                    60
                )
            ) % 60
        );


    const seconds =
        Math.floor(
            (
                difference /
                1000
            ) % 60
        );


    daysElement.textContent =
        formatNumber(days);

    hoursElement.textContent =
        formatNumber(hours);

    minutesElement.textContent =
        formatNumber(minutes);

    secondsElement.textContent =
        formatNumber(seconds);

}


updateCountdown();


setInterval(
    updateCountdown,
    1000
);


/* FAQ */


const faqItems =
    document.querySelectorAll(
        ".faq-item"
    );


faqItems.forEach(
    item => {

        const question =
            item.querySelector(
                ".faq-question"
            );

        const answer =
            item.querySelector(
                ".faq-answer"
            );


        question.addEventListener(
            "click",
            () => {

                const isActive =
                    item
                        .classList
                        .contains(
                            "active"
                        );


                faqItems.forEach(
                    currentItem => {

                        currentItem
                            .classList
                            .remove(
                                "active"
                            );

                        const currentAnswer =
                            currentItem
                                .querySelector(
                                    ".faq-answer"
                                );

                        currentAnswer.style.maxHeight =
                            null;

                    }
                );


                if (
                    !isActive
                ) {

                    item
                        .classList
                        .add(
                            "active"
                        );

                    answer.style.maxHeight =
                        answer.scrollHeight +
                        "px";

                }

            }
        );

    }
);


/* BOTÃO DE INGRESSO */


const ticketButton =
    document.getElementById(
        "ticketButton"
    );

const toast =
    document.getElementById(
        "toast"
    );


let toastTimeout;


ticketButton.addEventListener(
    "click",
    () => {

        toast.classList.add(
            "visible"
        );


        clearTimeout(
            toastTimeout
        );


        toastTimeout =
            setTimeout(
                () => {

                    toast
                        .classList
                        .remove(
                            "visible"
                        );

                },
                3500
            );

    }
);