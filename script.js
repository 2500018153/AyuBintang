document.addEventListener('DOMContentLoaded', function () {

    /* ========== MUSICIAN DATA ========== */
    var musicianList = [
        { id: 'hindia', name: 'Hindia', genre: 'Indie Pop / Alternative', city: 'Jakarta', song: 'Rumah Ke Rumah', photo: 'hindia.jpg' },
        { id: 'fourtwnty', name: 'Fourtwnty', genre: 'Folk / Indie', city: 'Jakarta', song: 'Fana Merah Jambu', photo: 'fourtwnty.jpg' },
        { id: 'reality-club', name: 'Reality Club', genre: 'Indie Rock', city: 'Jakarta', song: 'Anything You Want', photo: 'realityclub.jpg' }
    ];

    var KEY_COUNTER = 'indiesound_counter';
    var KEY_VOTES = 'indiesound_votes';

    /* ========== STORAGE HELPERS (replaces .txt files) ========== */
    function readVotes() {
        try {
            return JSON.parse(localStorage.getItem(KEY_VOTES)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveVotes(votes) {
        try {
            localStorage.setItem(KEY_VOTES, JSON.stringify(votes));
            return true;
        } catch (e) {
            return false;
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ========== HIT COUNTER ========== */
    function updateCounter() {
        var n = 0;
        try {
            n = parseInt(localStorage.getItem(KEY_COUNTER), 10) || 0;
            n++;
            localStorage.setItem(KEY_COUNTER, n);
        } catch (e) { n = 1; }
        document.getElementById('counter').textContent = n;
    }

    /* ========== RENDERING ========== */
    function countVotes() {
        var counts = {};
        musicianList.forEach(function (m) { counts[m.name] = 0; });
        readVotes().forEach(function (v) {
            if (counts.hasOwnProperty(v.musician)) counts[v.musician]++;
        });
        return counts;
    }

    function render() {
        var counts = countVotes();

        document.getElementById('musician-grid').innerHTML = musicianList.map(function (m) {
            return '<article class="musician-card">' +
                '<img src="' + escapeHtml(m.photo) + '" alt="Photo of ' + escapeHtml(m.name) + '" class="musician-photo">' +
                '<div class="musician-info">' +
                '<h3>' + escapeHtml(m.name) + '</h3>' +
                '<p><strong>Genre:</strong> ' + escapeHtml(m.genre) + '</p>' +
                '<p><strong>Hometown:</strong> ' + escapeHtml(m.city) + '</p>' +
                '<p><strong>Signature Song:</strong> ' + escapeHtml(m.song) + '</p>' +
                '<p class="vote-count">Votes: ' + counts[m.name] + '</p>' +
                '</div></article>';
        }).join('');

        document.getElementById('results-list').innerHTML = musicianList.map(function (m) {
            return '<li>' + escapeHtml(m.name) + ' : <strong>' + counts[m.name] + ' votes</strong></li>';
        }).join('');
    }

    function fillDropdown() {
        var select = document.getElementById('musician');
        musicianList.forEach(function (m) {
            var opt = document.createElement('option');
            opt.value = m.name;
            opt.textContent = m.name;
            select.appendChild(opt);
        });
    }

    function showStatus(success) {
        var el = document.getElementById('status-message');
        el.innerHTML = success
            ? '<div class="message message-success">✅ Thank you! Your vote has been saved successfully.</div>'
            : '<div class="message message-error">⚠️ Sorry, the data is invalid or could not be saved. Please try again.</div>';
    }

    document.getElementById('year').textContent = new Date().getFullYear();
    fillDropdown();
    render();
    updateCounter();

    /* ========== FORM VALIDATION ========== */
    var form = document.getElementById('voting-form');
    var inputName = document.getElementById('name');
    var inputEmail = document.getElementById('email');
    var selectMusician = document.getElementById('musician');
    var textareaReason = document.getElementById('reason');

    var errorName = document.getElementById('error-name');
    var errorEmail = document.getElementById('error-email');
    var errorMusician = document.getElementById('error-musician');
    var errorReason = document.getElementById('error-reason');

    function showError(inputElement, errorElement, message) {
        errorElement.textContent = message;
        inputElement.classList.add('invalid');
    }

    function clearError(inputElement, errorElement) {
        errorElement.textContent = '';
        inputElement.classList.remove('invalid');
    }

    function isEmailValid(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // no server, so everything is handled in JS

        var valueName = inputName.value.trim();
        var valueEmail = inputEmail.value.trim();
        var valueMusician = selectMusician.value;
        var valueReason = textareaReason.value.trim();

        clearError(inputName, errorName);
        clearError(inputEmail, errorEmail);
        clearError(selectMusician, errorMusician);
        clearError(textareaReason, errorReason);

        var formValid = true;

        if (valueName === '') {
            showError(inputName, errorName, 'Name cannot be empty.');
            formValid = false;
        }

        if (valueEmail === '') {
            showError(inputEmail, errorEmail, 'Email cannot be empty.');
            formValid = false;
        } else if (!isEmailValid(valueEmail)) {
            showError(inputEmail, errorEmail, 'Invalid email format.');
            formValid = false;
        }

        if (valueMusician === '') {
            showError(selectMusician, errorMusician, 'Please select one musician.');
            formValid = false;
        }

        if (valueReason === '') {
            showError(textareaReason, errorReason, 'Reason cannot be empty.');
            formValid = false;
        } else if (valueReason.length < 15) {
            showError(textareaReason, errorReason,
                'Reason must be at least 15 characters (currently ' + valueReason.length + ').');
            formValid = false;
        }

        if (!formValid) return;

        /* ========== SAVE VOTE (replaces proses_vote.php) ========== */
        var votes = readVotes();
        votes.push({
            name: valueName,
            email: valueEmail,
            musician: valueMusician,
            reason: valueReason,
            date: new Date().toLocaleString('en-US')
        });

        var saved = saveVotes(votes);
        showStatus(saved);
        if (saved) {
            form.reset();
            render();
        }
    });

    inputName.addEventListener('input', function () { clearError(inputName, errorName); });
    inputEmail.addEventListener('input', function () { clearError(inputEmail, errorEmail); });
    selectMusician.addEventListener('change', function () { clearError(selectMusician, errorMusician); });
    textareaReason.addEventListener('input', function () { clearError(textareaReason, errorReason); });

});
