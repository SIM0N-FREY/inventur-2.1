document.addEventListener('DOMContentLoaded', () => {
    const inventoryData = {
        '8Ø': [
            { name: '3/3', weight: 3.9 },
            { name: '3/6', weight: 4.6 },
            { name: '6/6', weight: 5.2 },
            { name: '3', weight: 1.9 },
            { name: '6', weight: 2.6 },
            { name: '5', weight: 1.4 },
            { name: '10', weight: 2.5 },
            { name: '15', weight: 3.6 }
        ],
        '6Ø': [
            { name: '3/3', weight: 3.3 },
            { name: '3/6', weight: 3.6 },
            { name: '6/6', weight: 4.0 },
            { name: '3', weight: 1.6 },
            { name: '6', weight: 2.0 },
            { name: '5', weight: 0.7 },
            { name: '10', weight: 1.4 },
            { name: '15', weight: 2.0 }
        ],
        'Sonst.': [
            { name: 'Schäkel 1t', weight: 666 },
            { name: 'Schäkel 2t', weight: 666 },
            { name: 'Anschlag 1,5m', weight: 666 },
            { name: 'Anschlag 3m', weight: 666 },
            { name: 'O-Ring', weight: 666 }
        ],
        'Strom': [
            { name: 'PE 40m', weight: 666 },
            { name: 'SchuKo 20m', weight: 666 }
        ]
    };

    const BOX_WEIGHT = 65;

    // DOM Elements
    const categoryGroup = document.getElementById('categoryGroup');
    const itemSelect = document.getElementById('itemSelect');
    const itemSelectGroup = document.getElementById('itemSelectGroup');
    const boxWeight = document.getElementById('boxWeight');
    const countResult = document.getElementById('countResult');
    const calculateBtn = document.getElementById('calculateBtn');
    const fertigBtn = document.getElementById('fertigBtn');
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmBoxNumber = document.getElementById('confirmBoxNumber');
    const confirmWeight = document.getElementById('confirmWeight');
    const confirmCount = document.getElementById('confirmCount');
    const abortBtn = document.getElementById('abortBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const statusMsg = document.getElementById('statusMsg');

    // Kategorie-Auswahl dynamisch aufbauen
    Object.keys(inventoryData).forEach(category => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'category';
        input.value = category;
        label.appendChild(input);
        label.appendChild(document.createTextNode(category));
        categoryGroup.appendChild(label);

        input.addEventListener('change', () => {
            updateItemSelect(category);
        });
    });

    function updateItemSelect(category) {
        itemSelect.innerHTML = '<option value="">Bitte wählen...</option>';
        inventoryData[category].forEach(item => {
            const option = document.createElement('option');
            option.value = item.name;
            option.textContent = `${item.name} (${item.weight} kg)`;
            itemSelect.appendChild(option);
        });
        itemSelectGroup.style.display = 'block';
    }

    calculateBtn.addEventListener('click', () => {
        const selectedCategory = document.querySelector('input[name="category"]:checked')?.value;
        const selectedItem = itemSelect.value;

        if (!selectedCategory || !selectedItem) {
            alert('Bitte wählen Sie eine Kategorie und einen Artikel');
            return;
        }

        const itemWeight = inventoryData[selectedCategory].find(i => i.name === selectedItem).weight;
        const boxWeightValue = parseFloat(boxWeight.value);

        if (isNaN(boxWeightValue)) {
            alert('Bitte geben Sie ein gültiges Gewicht ein');
            return;
        }

        const netWeight = boxWeightValue - BOX_WEIGHT;
        if (netWeight <= 0) {
            alert('Gesamtgewicht muss größer als das Kistengewicht (65 kg) sein');
            return;
        }

        const calculation = netWeight / itemWeight;
        countResult.textContent = calculation.toFixed(3);
    });

    fertigBtn.addEventListener('click', () => {
        const boxNumber = document.getElementById('boxNumber').value;
        if (!boxNumber || countResult.textContent === '-') {
            alert('Bitte füllen Sie alle Felder aus und berechnen Sie zuerst');
            return;
        }

        confirmBoxNumber.textContent = boxNumber;
        confirmWeight.textContent = boxWeight.value;
        confirmCount.textContent = countResult.textContent;
        confirmDialog.style.display = 'flex';
    });

    abortBtn.addEventListener('click', () => {
        confirmDialog.style.display = 'none';
    });

    confirmBtn.addEventListener('click', () => {
        const selectedCategory = document.querySelector('input[name="category"]:checked')?.value;
        const selectedItem = itemSelect.value;
        const box = document.getElementById('boxNumber').value;
        const weight = parseFloat(boxWeight.value);
        const counted = parseFloat(countResult.textContent);

        if (!selectedCategory || !selectedItem || !box || isNaN(weight) || isNaN(counted)) {
            alert('Bitte alle Felder korrekt ausfüllen');
            return;
        }

        const daten = {
            box: `Box ${box.padStart(3, '0')}`,
            material: selectedItem,
            weight: weight,
            counted: counted
        };

        const url = "https://script.google.com/macros/s/AKfycbyiFlqj8r3tUN-D5JfjeyFPa3W7j89qMiLrdUAmqr9v-zlAGd4UZBCLEC7RiItWT7dr/exec" ; // <--- DEINE URL HIER!

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(daten)
        })
        .then(response => response.text())
        .then(text => {
            zeigeStatus("✅ Erfolgreich gespeichert!", "green");
            // Zurücksetzen
            document.getElementById('boxNumber').value = '';
            document.querySelector('input[name="category"]:checked').checked = false;
            itemSelectGroup.style.display = 'none';
            itemSelect.value = '';
            boxWeight.value = '';
            countResult.textContent = '-';
            confirmDialog.style.display = 'none';
        })
        .catch(error => {
            zeigeStatus("❌ Fehler beim Speichern!", "red");
            console.error(error);
        });
    });

    function zeigeStatus(text, farbe) {
        statusMsg.textContent = text;
        statusMsg.style.display = 'block';
        statusMsg.style.backgroundColor = farbe === "green" ? "#C8E6C9" : "#FFCDD2";
        statusMsg.style.color = farbe === "green" ? "#256029" : "#B71C1C";
    }
});
