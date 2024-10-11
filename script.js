if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('ServiceWorker registrato con successo: ', registration);
      }, function(err) {
        console.log('ServiceWorker registrazione fallita: ', err);
      });
    });
  }
  
// Configura EmailJS
emailjs.init("u_HmkgPY5UzGWQMYn");

// Funzione di login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'Admin' && password === 'admin123') {
        document.getElementById('home-page').style.display = 'none';
        document.getElementById('admin-page').style.display = 'block';
        caricaPazienti();
        caricaOrdini();
    } else {
        alert('Credenziali errate');
    }
}

// Funzione per mostrare la sezione selezionata
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Memorizzazione pazienti e ordini in localStorage
let pazienti = JSON.parse(localStorage.getItem('pazienti')) || [];
let ordini = JSON.parse(localStorage.getItem('ordini')) || [];

// Funzione per registrare un paziente (anagrafica intelligente)
function registraPaziente() {
    const nome = document.getElementById('nome').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const medico = document.getElementById('medico').value.trim();
    const edificio = document.getElementById('edificio').value;
    const dataInstallazione = document.getElementById('data-installazione').value;

    const pazienteEsistente = pazienti.find(p => p.nome === nome && p.telefono === telefono && p.email === email);

    if (pazienteEsistente) {
        alert('Questo paziente è già registrato.');
        return;
    }

    const paziente = {
        nome, telefono, email, medico, edificio, dataInstallazione,
        password: 'Pz-' + Math.floor(Math.random() * 10000),
        scadenza: new Date(new Date(dataInstallazione).getTime() + (15 * 24 * 60 * 60 * 1000))
    };

    pazienti.push(paziente);
    localStorage.setItem('pazienti', JSON.stringify(pazienti));
    alert('Paziente registrato con successo');
    caricaPazienti();  // Aggiorna la lista dei pazienti
}

// Funzione per caricare pazienti nel menu a tendina
function caricaPazienti() {
    const pazientiList = document.getElementById('pazienti-list');
    pazientiList.innerHTML = '<option value="">-- Seleziona un paziente --</option>';
    pazienti.forEach((paziente, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = paziente.nome;
        pazientiList.appendChild(option);
    });
}

// Funzione per visualizzare dettagli paziente
function visualizzaPaziente() {
    const index = document.getElementById('pazienti-list').value;
    const paziente = pazienti[index];
    const pazienteInfo = document.getElementById('paziente-info');
    if (paziente) {
        pazienteInfo.innerHTML = `Nome: ${paziente.nome}, Scadenza Sensore: ${new Date(paziente.scadenza).toLocaleDateString()}`;
    }
}

// Funzione per modificare un paziente
function modificaPaziente() {
    const index = document.getElementById('pazienti-list').value;
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const medico = document.getElementById('medico').value.trim();
    const edificio = document.getElementById('edificio').value;
    const dataInstallazione = document.getElementById('data-installazione').value;

    const paziente = pazienti[index];
    paziente.telefono = telefono;
    paziente.email = email;
    paziente.medico = medico;
    paziente.edificio = edificio;
    paziente.dataInstallazione = dataInstallazione;
    paziente.scadenza = new Date(new Date(dataInstallazione).getTime() + (15 * 24 * 60 * 60 * 1000));

    localStorage.setItem('pazienti', JSON.stringify(pazienti));
    alert('Paziente modificato con successo');
    caricaPazienti();
}

// Funzione per scaricare report pazienti in PDF
function scaricaPazienteReport() {
    const { jsPDF } = window.jspdf;
    const index = document.getElementById('pazienti-list').value;

    if (index === "") {
        alert("Seleziona un paziente per generare il report.");
        return;
    }

    const paziente = pazienti[index];
    const doc = new jsPDF();

    doc.text(`Report Paziente`, 10, 10);
    doc.text(`Nome: ${paziente.nome}`, 10, 20);
    doc.text(`Email: ${paziente.email}`, 10, 30);
    doc.text(`Medico Prescrittore: ${paziente.medico}`, 10, 40);
    doc.text(`Data di Prima Installazione: ${new Date(paziente.dataInstallazione).toLocaleDateString()}`, 10, 50);
    doc.text(`Scadenza Sensore: ${new Date(paziente.scadenza).toLocaleDateString()}`, 10, 60);

    doc.save(`${paziente.nome}_report.pdf`);
}

// Funzione per inviare report pazienti via email
function inviaPazienteReport() {
    const index = document.getElementById('pazienti-list').value;
    const paziente = pazienti[index];

    if (!paziente) {
        alert('Seleziona un paziente.');
        return;
    }

    const emailParams = {
        to_email: "zagroblue16@gmail.com",
        from_name: "Gestionale Azienda",
        subject: `Report Paziente - ${paziente.nome}`,
        message: `
            Nome: ${paziente.nome}
            Email: ${paziente.email}
            Medico Prescrittore: ${paziente.medico}
            Data Prima Installazione: ${new Date(paziente.dataInstallazione).toLocaleDateString()}
            Scadenza Sensore: ${new Date(paziente.scadenza).toLocaleDateString()}
        `
    };

    emailjs.send('alessandro.servicesyai', 'template_ax0ti1j', emailParams)
        .then(function(response) {
            alert('Report inviato con successo via email!');
        }, function(error) {
            alert('Errore durante l\'invio dell\'email: ' + JSON.stringify(error));
        });
}

// Funzione per scaricare un report completo prima del reset
function scaricaReportCompleto() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Report Completo", 10, 10);

    doc.text("Pazienti Registrati:", 10, 20);
    pazienti.forEach((paziente, index) => {
        doc.text(`${index + 1}. Nome: ${paziente.nome}, Scadenza: ${new Date(paziente.scadenza).toLocaleDateString()}`, 10, 30 + index * 10);
    });

    doc.text("Ordini Farmacia:", 10, 30 + pazienti.length * 10);
    ordini.forEach((ordine, index) => {
        doc.text(`${index + 1}. Farmacia: ${ordine.intestazione}, Data Ordine: ${new Date(ordine.dataOrdine).toLocaleDateString()}`, 10, 40 + (pazienti.length + index) * 10);
    });

    doc.save("report_completo.pdf");
}

// Funzione per resettare il gestionale
function resetGestionale() {
    scaricaReportCompleto();  // Scarica il report completo prima del reset
    localStorage.clear();  // Cancella tutti i dati
    alert("Gestionale resettato con successo.");
    window.location.reload();  // Ricarica la pagina
}

// Funzione per caricare gli ordini nella sezione amministratore
function caricaOrdini() {
    const reportOrdini = document.getElementById('report-ordini');
    reportOrdini.innerHTML = '';
    ordini.forEach(ordine => {
        const ordineInfo = document.createElement('div');
        ordineInfo.textContent = `Farmacia: ${ordine.intestazione}, Qtà: ${ordine.pezzi}, Totale: ${(ordine.pezzi * ordine.prezzo - ordine.sconto).toFixed(2)}€`;
        reportOrdini.appendChild(ordineInfo);
    });
}

function mostraOrdini() {
    caricaOrdini();
    alert('Ordini mostrati nella sezione report.');
}
