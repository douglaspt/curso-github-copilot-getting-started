document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Função para renderizar as atividades com participantes
  function renderActivities(activities) {
    const list = document.getElementById("activities-list");
    list.innerHTML = "";
    Object.entries(activities).forEach(([name, data]) => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <h4>${name}</h4>
        <p>${data.description}</p>
        <p><strong>Schedule:</strong> ${data.schedule}</p>
        <p><strong>Max participants:</strong> ${data.max_participants}</p>
        <div class="participants-section">
          <span class="participants-title">Participants:</span>
          <ul class="participants-list">
            ${
              data.participants.length
                ? data.participants.map(email => `<li>${email}</li>`).join("")
                : '<li class="no-participants">No participants yet</li>'
            }
          </ul>
        </div>
      `;
      list.appendChild(card);
    });
  }

  // Carregar atividades ao iniciar
  function loadActivities() {
    fetch("/activities")
      .then(res => res.json())
      .then(renderActivities);
  }

  // Preencher o select de atividades
  function fillActivitySelect(activities) {
    const select = document.getElementById("activity");
    select.innerHTML = '<option value="">-- Select an activity --</option>';
    Object.keys(activities).forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }

  // Initialize app
  fetchActivities();

  fetch("/activities")
    .then(res => res.json())
    .then(activities => {
      renderActivities(activities);
      fillActivitySelect(activities);
    });

  // Formulário de inscrição
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Atualiza as atividades e participantes
        loadActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });
});
