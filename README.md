QUICK QUIZ – APLICAȚIE WEB DE TESTARE RAPIDĂ
=============================================

1. DESCRIERE GENERALĂ
----------------------
Quick Quiz este o aplicație web educațională de tip quiz, destinată testării rapide a cunoștințelor din diverse domenii (ex: Geografie, Istorie, Artă, Matematică). Proiectul oferă o interfață interactivă atât pentru utilizatori, cât și pentru administratori, fiind susținut de un backend Node.js și o bază de date Microsoft SQL Server.

2. STRUCTURA LIVRABILELOR
--------------------------
- Cod sursă complet (HTML, CSS, JavaScript pentru frontend și backend)
- Script SQL pentru crearea bazei de date QuickQuizDB
- Fișiere CSV pentru import de întrebări
- Acest fișier README.txt
- NU sunt incluse fișiere binare sau compilate

3. ADRESA REPOZITORIULUI GIT
-----------------------------
https://github.com/LauraTufis/QuickQuiz 

4. TEHNOLOGII UTILIZATE
------------------------
- Frontend: HTML5, CSS3, JavaScript (fără framework)
- Backend: Node.js + Express
- Bază de date: Microsoft SQL Server
- Alte biblioteci: Multer (pentru import fișiere), csv-parser, cors

5. PAȘI DE INSTALARE ȘI LANSARE APLICAȚIE
-----------------------------------------

5.1. Clonarea proiectului
-------------------------
git clone https://github.com/LauraTufis/QuickQuiz 
cd quick-quiz

5.2. Instalarea dependințelor backend
-------------------------------------
npm install

5.3. Configurarea bazei de date
-------------------------------
- Deschide SQL Server Management Studio
- Creează baza de date `QuickQuizDB`
- Rulează scriptul `database.sql` inclus în arhivă pentru a crea tabelele:
  • Users
  • Scores
  • Questions
  • Userul Admin cu urmatoarele date de conectare: admin@mail.com, parola: Admin123!


5.4. Pornirea serverului backend
--------------------------------
node server.js

Serverul va porni pe adresa: http://localhost:3000

5.6. Rularea aplicației
-----------------------
- Deschide fișierul `index.html` în browser  
  (Recomandat: Live Server din VS Code)

6. FUNCȚIONALITĂȚI APLICAȚIE
----------------------------

6.1. Utilizatori autentificați
------------------------------
- Înregistrare și autentificare
- Dashboard personal cu ultimele scoruri și top personal
- Selectarea categoriei și dificultății
- Rezolvarea quizului
- Salvarea scorului în baza de date
- Afisarea scorului si a unui top 5 scoruri


6.2. Utilizatori admin
----------------------
- Dashboard administrativ
- Adăugare/editare/ștergere întrebări
- Filtrare după categorie și dificultate
- Export/Import întrebări din fișiere CSV -3 fisiere CSV pt test import incluse in arhiva
- Vizualizare statistici generale scoruri și utilizatori

7. OBSERVAȚII FINALE
---------------------
- Aplicația rulează local, dar poate fi adaptată ușor pentru publicare online
- Codul sursă este organizat și documentat
- Frontend-ul și backend-ul sunt separate logic
- Fișierele CSS și JavaScript sunt refactorizate și reutilizabile
