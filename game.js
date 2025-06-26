const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

// 1. Obținem parametrii din URL
const queryParams = new URLSearchParams(window.location.search);
const selectedCategory = queryParams.get("category") || "";
const selectedDifficulty = queryParams.get("difficulty") || "";

// 2. Construim URL cu filtre
const apiUrl = `http://localhost:3000/questions?category=${selectedCategory}&difficulty=${selectedDifficulty}`;

// 3. Cerem întrebările din backend
fetch(apiUrl)
  .then(res => res.json())
  .then(loadedQuestions => {
    questions = loadedQuestions.map(q => {
      const formattedQuestion = {
        question: q.QuestionText,
        answer: q.CorrectAnswer
      };

      formattedQuestion["choice1"] = q.Choice1;
      formattedQuestion["choice2"] = q.Choice2;
      formattedQuestion["choice3"] = q.Choice3;
      formattedQuestion["choice4"] = q.Choice4;

      return formattedQuestion;
    });

    startGame();
  })
  .catch(err => {
    console.error("❌ Eroare la încărcarea întrebărilor:", err);
    alert("Eroare la încărcarea întrebărilor din baza de date.");
  });

// CONSTANTE
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
  game.classList.remove("hidden");
  loader.classList.add("hidden");
};

getNewQuestion = () => {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    sessionStorage.setItem('mostRecentScore', score);
    return window.location.assign("/results.html");
  }

  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerText = currentQuestion.question;

  choices.forEach(choice => {
    const number = choice.dataset['number'];
    choice.innerText = currentQuestion['choice' + number];
  });

  availableQuestions.splice(questionIndex, 1);
  acceptingAnswers = true;
};

choices.forEach(choice => {
  choice.addEventListener('click', e => {
    if (!acceptingAnswers) return;
    acceptingAnswers = false;

    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset['number'];
    const classToApply = selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

    if (classToApply === "correct") {
      incrementScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);
    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});

incrementScore = num => {
  score += num;
  scoreText.innerText = score;
};
