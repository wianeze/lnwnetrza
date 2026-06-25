LN poprawki v8

Zmiany względem v7:
1. Sekcja 01 Realizacje została powiększona.
2. Numer 01 wraca do dużej skali.
3. Tytuł i opis w lewej części są większe.
4. Wysokość kafelków galerii wraca do większej wartości.
5. Na desktopie od razu widać 4 kafelki galerii zamiast 3.

Najważniejsze wartości do edycji w styles/main.css, na końcu pliku w bloku:
V8 POPRAWKA SEKCJI 01

--ln-projects-text-width:minmax(320px,22vw);
--ln-project-card-min-height:680px;
--ln-projects-number-size:92px;
--ln-projects-title-size:clamp(38px,4.1vw,72px);

Jeśli chcesz jeszcze większą sekcję:
--ln-project-card-min-height:740px;

Jeśli chcesz więcej miejsca dla galerii:
--ln-projects-text-width:minmax(280px,18vw);

Jeśli chcesz większy tekst:
--ln-projects-title-size:clamp(44px,4.5vw,78px);
