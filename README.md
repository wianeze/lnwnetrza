# LN Architektura & Wnętrza — prototyp v3

Wersja zawiera zmiany z ostatniej listy:

- lżejszy gradient na hero,
- kafelki 10+, Wrocław, od A do Z przywrócone w prostym układzie i wycentrowane,
- „Zobacz, jak pracujemy” jako link z ikoną play nad kafelkami,
- logo z przekazanego pliku `logo.webp`,
- kolorowe ikony Instagrama i Facebooka,
- sekcja realizacji bez przerwy po hero,
- oferta w układzie 3 kolumn: zdjęcie, opis + podsumowanie, lista usług,
- sekcja 03 z pełnym tekstem o pracowni, opisem Pauli i Eweliny oraz zdjęciem z przejściem z czerni,
- kontakt z formularzem i mapką,
- galerie realizacji po kliknięciu pozostawione w działającej formie,
- animacje wjazdu elementów do góry podczas scrollowania.

## Jak podmienić zdjęcie hero

Wgraj plik do:

`assets/hero/poster.jpg`

Najlepiej: JPG, szerokość 2200–2600 px, poziomy kadr.

## Jak dodać film na pierwszy moduł

Wgraj film jako:

`assets/hero/hero.mp4`

Potem w pliku `scripts/data.js` ustaw:

```js
hero: {
  poster: "assets/hero/poster.jpg",
  video: "assets/hero/hero.mp4"
}
```

Najlepiej: MP4 H.264, 8–18 sekund, bez dźwięku, poniżej 10 MB.

## Jak dodać realizację

1. Dodaj folder, np.:

`assets/projects/nowa-realizacja/`

2. Wgraj zdjęcia:

`cover.jpg`, `02.jpg`, `03.jpg`, `04.jpg`

3. Dopisz projekt w `scripts/data.js` w tablicy `projects`.

Galeria po kliknięciu korzysta z listy `images`.

## Social media

Instagram: https://www.instagram.com/lnwnetrza/  
Facebook: https://www.facebook.com/LNwnetrza/
