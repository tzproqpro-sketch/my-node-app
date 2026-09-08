# Лабораторная работа 11

## Что сделано
- Node.js HTTP-сервер
- Вывод ФИО, группы и числа Пи до 9 знаков
- Базовая структура проекта для Git

## Данные студента
- ФИО: ЗУБЕЛИК ТРОФИМ АЛЕКСЕЕВИЧ
- Группа: 477
- Номер в журнале: 9
- GitHub: `tzproqpro-sketch`

## Как запустить
```bash
npm install
npm start
```

Открой `http://localhost:3000`.

## Что тебе нужно сделать вручную
1. Установить Node.js LTS, если его нет.
2. Установить Git, если его нет.
3. Создать репозиторий на GitHub: `my-node-app`.
4. Добавить преподавателя в Collaborators: `ilya-figa`.
5. Создать ветку `feature/student-info`.
6. Закоммитить изменения и запушить ветку.
7. Создать Pull Request `feature/student-info -> main`.

## Команды
```bash
git init
git add .
git commit -m "Initial commit: Hello World app"
git remote add origin https://github.com/tzproqpro-sketch/my-node-app.git
git branch -M main
git push -u origin main
git checkout -b feature/student-info
git add index.js
git commit -m "Added student info and Pi calculation"
git push -u origin feature/student-info
```
