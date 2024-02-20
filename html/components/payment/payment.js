const payment_script = () => {
    const CONFIRM_BAR = document.getElementById("payment").querySelector(".progress-bar .bar");
    const CONFIRM_BUTTON = document.getElementById("payment").querySelector("#confirm");
    const SECONDS_DISPLAY = document.getElementById("payment").querySelector("#seconds");
    const SUCCESS_PAGE = document.getElementById("payment").querySelector("#success-splash");

    const RECIPIENT_SELECTION_LIST = document.getElementById("payment").querySelector(".recipient-selection-list");
    const SELECTED_RECIPIENT_LIST = document.getElementById("payment").querySelector(".recipient-list");

    // Setup
    SUCCESS_PAGE.style.display = "none";
    CONFIRM_BAR.style.width = "0";

    let timer;
    const HOLD_TIME = 3000;
    const ONE_SECOND = 1000;

    let clock = HOLD_TIME;


    // Success Screen
    const success = function () {
        SUCCESS_PAGE.style.display = "inline-flex";
    }

    // Hold Loop
    const repeat = function () {
        SECONDS_DISPLAY.innerHTML = clock / ONE_SECOND;
        clock -= ONE_SECOND;
        CONFIRM_BAR.style.width = `${100 - (clock / HOLD_TIME) * 100}%`;
        if (clock > 0) {
            timer = setTimeout(repeat, ONE_SECOND);
        } else {
            setTimeout(success, ONE_SECOND)
        }
    }

    CONFIRM_BUTTON.addEventListener("mousedown", () => {
        repeat();
    });

    CONFIRM_BUTTON.addEventListener("mouseup", () => {
        clearTimeout(timer);
        clock = HOLD_TIME;
        CONFIRM_BAR.style.width = "0";
        SECONDS_DISPLAY.innerHTML = HOLD_TIME / ONE_SECOND;
    });

    // Recipient Managment
    let recipient_list = [
        {
            picture: "moon.png",
            name: "Lunar Lucas",
            status: "offline",
            selected: true,
            did: "did:key:z4MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
        },
        {
            picture: "blue_marble.png",
            name: "Johnny Space",
            status: "online",
            selected: false,
            did: "did:key:a6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
        },
        {
            picture: "mars.png",
            name: "Manny Mars",
            status: "idle",
            selected: true,
            did: "did:key:z5khaXgBZDvotDkL5257faiztiG2C2QtKLGpbnnEGta2doK"
        },
        {
            picture: "pluto.png",
            name: "Space Kev",
            status: "idle",
            selected: true,
            did: "did:key:z7kkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
        },
        {
            picture: "neptune.png",
            name: "Philltune",
            status: "do-not-disturb",
            selected: false,
            did: "did:key:0sMkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
        },
        {
            picture: "saturn.png",
            name: "Sara Saturn",
            status: "online",
            selected: false,
            did: "did:key:bAMkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
        }
    ];

    let make_recipient_html = (recipient) => {
        return `
        <div class="recipient">
            <div class="profile-picture">
                <img class="profile-image" src="/assets/${recipient.picture}" alt="">
                <div class="status-indicator ${recipient.status}"></div>
            </div>
            <div class="info">
                <p class="username">${recipient.name}</p>
                <p class="subtext text-muted hover-text" data-hover-text="${recipient.did}">
                    ${recipient.did}
                </p>
            </div>
            <input type="checkbox" ${(recipient.selected) ? "checked" : ""} />
        </div>
        `;
    }

    let make_mini_recipient_html = (recipient) => {
        return `
        <div class="mini-recipient">
            <div class="profile-picture smallest">
                <img class="profile-image" src="/assets/${recipient.picture}" alt="">
            </div>
            <p class="username hover-text" data-hover-text="${recipient.name}">${recipient.name}</p>
            <svg class="svg-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        `;
    }


    const update_recipients = () => {
        RECIPIENT_SELECTION_LIST.innerHTML = "";
        SELECTED_RECIPIENT_LIST.innerHTML = "";

        recipient_list.forEach(recipient => {
            RECIPIENT_SELECTION_LIST.innerHTML += make_recipient_html(recipient);
            if (recipient.selected) SELECTED_RECIPIENT_LIST.innerHTML += make_mini_recipient_html(recipient);
        })

        const DOM_RECIPIENTS = RECIPIENT_SELECTION_LIST.querySelectorAll(".recipient");

        DOM_RECIPIENTS.forEach(el => {
            el.addEventListener("click", () => {
                const did = el.querySelector(".subtext").innerHTML.trim();            
                const checkbox = el.lastElementChild;
                checkbox.checked = !checkbox.checked;
                recipient_index = recipient_list.findIndex(obj => obj.did == did);
                if (recipient_list !== null) {
                    recipient_list[recipient_index].selected = checkbox.checked;
                }
                update_recipients();
            });
        });
    }

    update_recipients();

};
