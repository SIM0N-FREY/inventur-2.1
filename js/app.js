document.addEventListener('DOMContentLoaded', () => {
    // Existing inventory data
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
    const SPREADSHEET_ID = '1RoqDCDmWotqb5hO1xGePMUsfe1uxNqqL8DA8_dqR1us';

    // Get DOM elements
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

    // Google Sheets API Functions
    async function initGoogleSheetsAPI() {
        try {
            await gapi.client.init({
                apiKey: 'AIzaSyB7435gKOUszcuQrOj6sXFD-HSVka650xs',
                clientId: '611626969566-074cgekp3nfbkhbbamikpodrs9dq7huj.apps.googleusercontent.com',
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: 'https://www.googleapis.com/auth/spreadsheets'
            });
            console.log('Google Sheets API initialized');
        } catch (error) {
            console.error('Error initializing Google Sheets API:', error);
        }
    }

    async function appendToSheet(formattedData) {
        const range = 'Sheet1!A:G';
        const values = [
            [
                formattedData.boxNumber,
                formattedData.category,
                formattedData.item,
                formattedData.count,
                formattedData.date,
                formattedData.time,
                formattedData.signature
            ]
        ];

        try {
            const response = await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });
            console.log('Data appended successfully', response.result);
            return response;
        } catch (error) {
            console.error('Error appending data:', error);
            throw error;
        }
    }

    gapi.load('client:auth2', initGoogleSheetsAPI);

    // Create category radio buttons
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
            alert('Gesamtgewicht muss größer als das Kistengewicht (60kg) sein');
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

    confirmBtn.addEventListener('click', async () => {
        const selectedCategory = document.querySelector('input[name="category"]:checked')?.value;
        const selectedItem = itemSelect.value;

        if (!selectedCategory || !selectedItem) {
            alert('Bitte wählen Sie eine Kategorie und einen Artikel');
            return;
        }

        const formattedData = {
            boxNumber: `Box ${document.getElementById('boxNumber').value.padStart(3, '0')}`,
            category: selectedCategory,
            item: selectedItem,
            count: countResult.textContent,
            date: new Date().toLocaleDateString('de-DE'),
            time: new Date().toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }),
            signature: "JS"
        };

        try {
            if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
                await gapi.auth2.getAuthInstance().signIn();
            }

            await appendToSheet(formattedData);
            console.log('Inventory saved successfully:', formattedData);

            document.getElementById('boxNumber').value = '';
            document.querySelector('input[name="category"]:checked').checked = false;
            itemSelectGroup.style.display = 'none';
            itemSelect.value = '';
            boxWeight.value = '';
            countResult.textContent = '-';
            confirmDialog.style.display = 'none';

        } catch (error) {
            console.error('Error saving inventory:', error);
            alert('Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.');
        }
    });
});
