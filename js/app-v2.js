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
            { name: '15', weight: 3.6 },
            { name: "Drop 3m", weight: 2.0 },
            { name: "Drop 6m", weight: 2.7 }
        ],
        '6Ø': [
            { name: '3/3', weight: 3.3 },
            { name: '3/6', weight: 3.6 },
            { name: '6/6', weight: 4.0 },
            { name: '3', weight: 1.6 },
            { name: '6', weight: 2.0 },
            { name: '5', weight: 0.7 },
            { name: '10', weight: 1.4 },
            { name: '15', weight: 2.0 },
            { name: "Drop 3m", weight: 1.7 },
            { name: "Drop 6m", weight: 2.1 }
        ],
        'Sonst.': [
            { name: 'Schäkel 1t', weight: 0.1 },
            { name: 'Schäkel 2t', weight: 666 },
            { name: 'Anschlag 1,5m', weight: 1.8 },
            { name: 'Anschlag 3m', weight: 666 },
            { name: 'O-Ring', weight: 666 }
        ],
        'Strom': [
            { name: 'PE 40m', weight: 666 },
            { name: 'SchuKo 20m', weight: 666 }
        ]
    };

    const categoryGroup = document.getElementById('categoryGroup');
    const itemSelect = document.getElementById('itemSelect');
    const itemSelectGroup = document.getElementById('itemSelectGroup');
    const boxWeight = document.getElementById('boxWeight');
    const countResult = document.getElementById('countResult');
    const calculateBtn = document.getElementById('calculateBtn');
    const fertigBtn = document.getElementById('fertigBtn');
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmMaterial = document.getElementById('confirmMaterial');
    const confirmWeight = document.getElementById('confirmWeight');
    const confirmEmptyWeight = document.getElementById('confirmEmptyWeight');
    const confirmCount = document.getElementById('confirmCount');
    const abortBtn = document.getElementById('abortBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const statusMsg = document.getElementById('statusMsg');

    const boxNumberDialog = document.getElementById('boxNumberDialog');
    const boxAbortBtn = document.getElementById('boxAbortBtn');
    const boxConfirmBtn = document.getElementById('boxConfirmBtn');

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
            alert('Bitte geben Sie ein gültiges Gesamtgewicht ein');
            return;
        }

        const emptyBoxValue = parseFloat(document.getElementById('boxNumber').value);
        const emptyBoxWeight = isNaN(emptyBoxValue) ? 65 : emptyBoxValue;

        const netWeight = boxWeightValue - emptyBoxWeight;

        if (netWeight <= 0) {
            alert(`Gesamtgewicht muss größer als das Eigengewicht der Gitterbox (${emptyBoxWeight} kg) sein`);
            return;
        }

        const calculation = netWeight / itemWeight;
        countResult.textContent = calculation.toFixed(3);
    });

    fertigBtn.addEventListener('click', () => {
        const selectedCategory = document.querySelector('input[name="category"]:checked')?.value;
        const selectedItem = itemSelect.value;
        const boxWeightValue = parseFloat(boxWeight.value);
        const emptyBoxValue = parseFloat(document.getElementById('boxNumber').value);
        const emptyBoxWeight = isNaN(emptyBoxValue) ? 65 : emptyBoxValue;
        const counted = parseFloat(countResult.textContent);

        if (!selectedCategory || !selectedItem || isNaN(boxWeightValue) || isNaN(counted)) {
            alert('Bitte alle Felder korrekt ausfüllen und zuerst berechnen.');
            return;
        }

        confirmMaterial.textContent = `${selectedCategory} ${selectedItem}`;
        confirmWeight.textContent = boxWeightValue.toFixed(2);
        confirmEmptyWeight.textContent = emptyBoxWeight.toFixed(2);
        confirmCount.textContent = Math.round(counted);

        confirmDialog.style.display = 'flex';
    });

    abortBtn.addEventListener('click', () => {
        confirmDialog.style.display = 'none';
    });

    confirmBtn.addEventListener('click', () => {
        confirmDialog.style.display = 'none';
        boxNumberDialog.style.display = 'flex';
    });

    boxAbortBtn.addEventListener('click', () => {
        boxNumberDialog.style.display = 'none';
    });

    boxConfirmBtn.addEventListener('click', () => {
        const enteredBoxNumber = document.getElementById('finalBoxNumber').value.trim();
        if (!enteredBoxNumber) {
            alert("Bitte Boxnummer eingeben.");
            return;
        }

        boxNumberDialog.style.display = 'none';
        zeigeStatus(`Boxnummer ${enteredBoxNumber} gespeichert (bzw. weiterverarbeitet)`, "green");
    });

    function zeigeStatus(text, farbe) {
        statusMsg.textContent = text;
        statusMsg.style.display = 'block';
        statusMsg.style.backgroundColor = farbe === "green" ? "#C8E6C9" : "#FFCDD2";
        statusMsg.style.color = farbe === "green" ? "#256029" : "#B71C1C";
    }
});
