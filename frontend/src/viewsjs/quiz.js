export async function QuizView(params){
  const container = document.createElement("div");
  container.classList.add("quiz-view");

  const quizId = params?.id;
  let currentQuestionIndex = 0;
  let score = 0;
  let quizData = null;
  let userAnswers = [];

  container.innerHTML = `<p>Cargando quiz...</p>`;

  try {
    const res = await fetch(`http://localhost:3001/api/quiz/${quizId}`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error HTTP: ${res.status} - ${text}`);
    }

    const data = await res.json();
    console.log(data);

    quizData = data;
    renderQuestion();

  } catch (err) {
    console.error("Error al cargar el quiz", err);
    container.innerHTML = `<p>Error al cargar el quiz: ${err.message}</p>`;
  }

  function renderQuestion() {
    console.log(quizData)
    const quiz = quizData.quiz;
    const question = quizData.quiz.questions[currentQuestionIndex];

    container.innerHTML = `
      <section>
        <h2>${quiz.name}</h2>
        <p><strong>Pregunta ${currentQuestionIndex + 1}:</strong> ${question.question}</p>
        <ul>
          ${question.options.map((opt, i) => `
            <li>
              <button class="option-btn" data-index="${i}">${opt}</button>
            </li>
          `).join("")}
        </ul>
      </section>
    `;

    const buttons = container.querySelectorAll(".option-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const selected = parseInt(btn.dataset.index);

        userAnswers.push({
          id_question: question.id, // ID de la pregunta
          selectedIndex: selected   // Índice seleccionado por el usuario
        });

        if (selected === question.answer) {
          score++;
        }

        if ((currentQuestionIndex + 1) < quizData.quiz.questions.length) {
          console.log(quizData.quiz.questions.length)
          console.log(currentQuestionIndex)
          currentQuestionIndex++;
          renderQuestion();
        } else {
          renderResult(quiz);
        }
      });
    });
  }

  async function renderResult(quiz) {
    container.innerHTML = `
      <section>
        <h2>Resultados</h2>
        <p>Completaste el quiz <strong>${quiz.name}</strong>.</p>
        <p>Tu puntuación: <strong>${score} / ${quiz.questions.length}</strong></p>
        <button id="volver-dashboard">Volver al dashboard</button>
      </section>
    `;
    const goBackBtn = container.querySelector("#volver-dashboard");

    submitQuizResults(quiz, goBackBtn)
  }

  async function submitQuizResults(quiz, goBackBtn) {
    try {
      const response = await fetch(`http://localhost:3001/progress/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          answers: userAnswers
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Resultados enviados", result);

      container.innerHTML = `
        <section>
          <h2>¡Quiz Completado!</h2>
          <p>Quiz: <strong>${quiz.name}</strong></p>
          <div class="results-summary">
            <p>Respuestas correctas: <strong>${result.correct} / ${result.total}</strong></p>
            <p>Puntuación: <strong>${result.percent}%</strong></p>
            ${result.percent >= 70 ?
              '<p class="success">¡Excelente trabajo! 🎉</p>' :
              '<p class="retry">Puedes intentarlo de nuevo para mejorar tu puntuación.</p>'
            }
          </div>
          <button id="volver-dashboard">Volver al dashboard</button>
        </section>
      `;

      container.querySelector("#volver-dashboard").addEventListener("click", () => {
        import("../router.js").then(({ navigate }) => {
          navigate("/dashboard");
        });
      });

     } catch (err) {
        console.error("Error al enviar resultados:", err);

        // Mostrar error pero permitir volver al dashboard
        container.innerHTML = `
          <section>
            <h2>Quiz Completado</h2>
            <p>Tu puntuación local: <strong>${score} / ${quiz.questions.length}</strong></p>
            <p class="error">⚠️ Error al guardar resultados: ${err.message}</p>
            <button id="volver-dashboard">Volver al dashboard</button>
          </section>
        `;

        container.querySelector("#volver-dashboard").addEventListener("click", () => {
          import("../router.js").then(({ navigate }) => {
            navigate("/dashboard");
          });
        })
      }
  }

  return container;
};
