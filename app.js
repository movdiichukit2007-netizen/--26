// Адреса серверного сервісу
const serviceUrl = 'http://localhost:5000/postings';

// Тестові дані на випадок, якщо локальний бекенд не запущено
let defaultData = [
    { from: 'Рівне', to: 'Луцьк', content: 'подарунок', deliveryType: 0, weight: 6, width: 10, height: 10, depth: 10, value: 100, price: 1000 },
    { from: 'Київ', to: 'Львів', content: 'документи', deliveryType: 1, weight: 1, width: 30, height: 5, depth: 20, value: 50, price: 120 },
    { from: 'Одеса', to: 'Харків', content: 'посилка', deliveryType: 0, weight: 3, width: 25, height: 15, depth: 15, value: 300, price: 180 }
];

// 1. Завантаження даних із сервера (GET)
async function loadData() {
    try {
        const response = await fetch(serviceUrl);
        if (!response.ok) {
            throw new Error('Сервер повернув помилку: ' + response.status);
        }
        return await response.json();
    } catch (error) {
        console.warn('Сервер не відповідає, показуємо локальні дані:', error.message);
        return defaultData;
    }
}

// 2. Створення окремої клітинки
function createCell(fieldName, model) {
    const cell = document.createElement('td');
    cell.textContent = model[fieldName] !== undefined ? model[fieldName] : '';
    return cell;
}

// 3. Побудова таблиці за метаданими з атрибутів x-column
function renderTable(data) {
    const tableBody = document.getElementById('postings');
    const tableHeader = document.getElementById('table-header');
    tableBody.innerHTML = '';
    
    const columns = tableHeader.querySelectorAll('th');
    
    for (const posting of data) {
        const row = document.createElement('tr');
        for (const column of columns) {
            const fieldName = column.getAttribute('x-column');
            if (fieldName) {
                const cell = createCell(fieldName, posting);
                if (column.classList.contains('number')) {
                    cell.classList.add('number');
                }
                row.appendChild(cell);
            }
        }
        tableBody.appendChild(row);
    }
}

// 4. Оновлення сторінки
async function refresh() {
    const status = document.getElementById('status');
    status.textContent = 'Завантаження відправлень…';
    
    try {
        const postings = await loadData();
        renderTable(postings);
        status.textContent = 'Дані успішно завантажено (всього: ' + postings.length + ')';
    } catch (error) {
        status.textContent = 'Помилка при завантаженні: ' + error.message;
    }
}

// 5. Створення нового запису (POST)
async function createPosting(posting) {
    try {
        const response = await fetch(serviceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(posting)
        });
        if (!response.ok) {
            throw new Error('Не вдалося створити відправлення: ' + response.status);
        }
        return await response.json();
    } catch (error) {
        console.warn('Помилка POST, додаємо локально:', error.message);
        defaultData.push(posting);
        return posting;
    }
}

// 6. Оновлення запису (PUT)
async function updatePosting(id, posting) {
    const response = await fetch(serviceUrl + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posting)
    });
    if (!response.ok) {
        throw new Error('Не вдалося оновити відправлення: ' + response.status);
    }
    return await response.json();
}

// 7. Видалення запису (DELETE)
async function deletePosting(id) {
    const response = await fetch(serviceUrl + '/' + id, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Не вдалося видалити відправлення: ' + response.status);
    }
}

// Події після завантаження сторінки
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-refresh').addEventListener('click', refresh);
    
    document.getElementById('btn-add').addEventListener('click', async function () {
        const testItem = {
            from: 'Житомир',
            to: 'Полтава',
            content: 'книги',
            deliveryType: 0,
            weight: 2,
            width: 20,
            height: 10,
            depth: 15,
            value: 200,
            price: 90
        };
        await createPosting(testItem);
        await refresh();
    });

    refresh();
});
