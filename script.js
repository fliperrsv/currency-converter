// ==================== ТЁМНАЯ ТЕМА ====================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('currencyTheme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.hasAttribute('data-theme');
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('currencyTheme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('currencyTheme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// ==================== DOM ЭЛЕМЕНТЫ ====================
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const refreshBtn = document.getElementById('refreshBtn');
const convertedSpan = document.getElementById('convertedAmount');
const rateInfoSpan = document.getElementById('rateInfo');

let currentRate = null;
let isLoading = false;

// Сохранение последних выбранных валют
function loadCurrencySettings() {
    const savedFrom = localStorage.getItem('currencyFrom');
    const savedTo = localStorage.getItem('currencyTo');
    if (savedFrom) fromSelect.value = savedFrom;
    if (savedTo) toSelect.value = savedTo;
}
function saveCurrencySettings() {
    localStorage.setItem('currencyFrom', fromSelect.value);
    localStorage.setItem('currencyTo', toSelect.value);
}

// ==================== НОВЫЙ API (STABLE) ====================
async function fetchRate(from, to) {
    try {
        // Используем стабильный API Frankfurter (не требует ключа)
        const url = `https://api.frankfurter.app/v1/latest?base=${from}&symbols=${to}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки');
        const data = await response.json();
        const rate = data.rates[to];
        if (!rate) throw new Error('Курс не найден');
        currentRate = rate;
        rateInfoSpan.innerHTML = `1 ${from} = ${rate.toFixed(4)} ${to} | 1 ${to} = ${(1/rate).toFixed(4)} ${from}`;
        return rate;
    } catch (error) {
        console.error(error);
        rateInfoSpan.innerHTML = '❌ Ошибка загрузки курса. Попробуйте позже.';
        return null;
    }
}

// Конвертация
async function convert() {
    if (isLoading) return;
    isLoading = true;
    convertedSpan.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    const from = fromSelect.value;
    const to = toSelect.value;
    const amount = parseFloat(amountInput.value) || 0;
    
    const rate = await fetchRate(from, to);
    if (rate !== null) {
        const converted = amount * rate;
        convertedSpan.innerHTML = `${converted.toFixed(2)} ${to}`;
        saveCurrencySettings();
    } else {
        convertedSpan.innerHTML = 'Ошибка';
    }
    isLoading = false;
}

// Обмен валют
function swapCurrencies() {
    const fromVal = fromSelect.value;
    const toVal = toSelect.value;
    fromSelect.value = toVal;
    toSelect.value = fromVal;
    convert();
}

// События
fromSelect.addEventListener('change', () => {
    saveCurrencySettings();
    convert();
});
toSelect.addEventListener('change', () => {
    saveCurrencySettings();
    convert();
});
amountInput.addEventListener('input', convert);
swapBtn.addEventListener('click', swapCurrencies);
refreshBtn.addEventListener('click', convert);

// Загрузка
loadCurrencySettings();
convert();