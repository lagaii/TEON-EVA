# Приглашение TEON & EVA

## 1. Что уже сделано
- `index.html`, `style.css`, `script.js` — готовый сайт
- Персональные ссылки для гостей (Слава, Оксана, Евгения)
- Календарь и дата подставляются автоматически из `script.js`
- Кнопка музыки и RSVP уже работают, нужно только:

## 2. Что нужно доделать перед запуском

### Возраст
В `index.html` и `script.js` замените `"Заполните возраст"` на нужный текст,
например `"5 лет"`.

### Фото
Положите файлы в папку `photos/`:
- `hero.jpg` — главное фото на обложке
- `message.jpg` — маленькое круглое фото (необязательно)
Пока файлов нет — вместо фото будет мягкая плашка-подсказка, сайт не сломается.

### Музыка
⚠️ Я не могу вшить в сайт саму композицию "Beethoven's 5 Secrets" (The Piano Guys) —
это чужой авторский трек, и я не подкладываю чужую музыку в файлы без вас.
Что сделать:
1. Купите/скачайте трек легально (iTunes, Bandcamp, лицензия автора и т.п.)
2. Сконвертируйте в `.mp3`
3. Положите файл в `music/song.mp3` — плеер подхватит его автоматически

## 3. Google Sheets для RSVP-ответов

1. Создайте новую Google-таблицу (sheets.google.com)
2. Расширения → Apps Script
3. Вставьте туда этот код вместо стандартного:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('RSVP');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Дата ответа', 'Slug гостя', 'Имя', 'Ответ']);
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.guest, data.name, data.answer]);
  return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
  var guest = e.parameter.guest;
  var answer = null;
  if (sheet) {
    var rows = sheet.getDataRange().getValues();
    for (var i = rows.length - 1; i >= 1; i--) {
      if (rows[i][1] === guest) { answer = rows[i][3]; break; }
    }
  }
  return ContentService.createTextOutput(JSON.stringify({guest: guest, answer: answer}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Нажмите **Развернуть → Новое развёртывание**
5. Тип: **Веб-приложение**
   - Кто имеет доступ: **Все (Anyone)**
6. Разверните, разрешите доступ от своего аккаунта Google
7. Скопируйте выданный URL (заканчивается на `/exec`)
8. Вставьте его в `script.js` в строку:
   ```javascript
   RSVP_ENDPOINT: "СЮДА_ВСТАВЬ_URL",
   ```

После этого все ответы гостей будут появляться в вашей Google-таблице во вкладке `RSVP`.

## 4. Персональные ссылки для гостей

- `https://ваш-сайт.github.io/?guest=slava` — Слава
- `https://ваш-сайт.github.io/?guest=oksana` — Оксана
- `https://ваш-сайт.github.io/?guest=evgenia` — Евгения

Чтобы добавить ещё гостей — впишите их в `CONFIG.GUESTS` в `script.js`:
```javascript
GUESTS: {
  slava: "Слава",
  oksana: "Оксана",
  evgenia: "Евгения",
  novyi_slug: "Имя Гостя",
},
```

## 5. Публикация на GitHub Pages

1. Создайте новый репозиторий на GitHub (например `teon-eva-invite`)
2. Загрузите туда все файлы из этой папки (`index.html`, `style.css`, `script.js`, папки `photos/` и `music/`)
3. Settings → Pages → Source: **Deploy from a branch**, ветка `main`, папка `/ (root)`
4. Через пару минут сайт будет доступен по адресу `https://ваш-логин.github.io/teon-eva-invite/`

## 6. Место проведения

Адрес уже вставлен: `경기도 화성시 행정서로 3길 13 (PARADISE)`, кнопка ведёт на Naver Map.
Если хотите Kakao Map вместо Naver — скажите, поменяю ссылку.
