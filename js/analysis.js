// analysis.js - Contains logic for comparing resume and job description text

/**
 * Preprocess text by lowercasing, removing punctuation, and splitting into words.
 * Remove stop words and very short words.
 * @param {string} text
 * @returns {string[]} array of words
 */
function tokenize(text) {
  const stopWords = new Set([
    "the", "and", "or", "but", "with", "a", "an", "to", "of", "in", "on", "for", "at", "by", "is",
    "this", "that", "these", "those", "are", "be", "as", "it", "from", "you", "your", "yours"
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

/**
 * Compare resume and job description to compute match score and find missing keywords.
 * @param {string} resumeText
 * @param {string} jobText
 * @returns {object} with matchScore and missingKeywords array
 */
function compareResume(resumeText, jobText) {
  const resumeTokens = new Set(tokenize(resumeText));
  const jobTokens = tokenize(jobText);

  const uniqueJobTokens = Array.from(new Set(jobTokens));
  let matched = 0;
  const missing = [];
  uniqueJobTokens.forEach((token) => {
    if (resumeTokens.has(token)) {
      matched++;
    } else {
      missing.push(token);
    }
  });
  const score = uniqueJobTokens.length === 0 ? 0 : Math.round((matched / uniqueJobTokens.length) * 100);
  return {
    matchScore: score,
    missingKeywords: missing.sort((a, b) => a.localeCompare(b))
  };
}

// Attach event listener to the Compare button on the tool page
document.addEventListener("DOMContentLoaded", () => {
  const compareBtn = document.getElementById("compareBtn");
  if (!compareBtn) return;
  compareBtn.addEventListener("click", () => {
    const resumeInput = document.getElementById("resumeInput");
    const jobInput = document.getElementById("jobInput");
    const results = document.getElementById("results");
    const matchScoreEl = document.getElementById("matchScore");
    const missingKeywordsEl = document.getElementById("missingKeywords");
    if (!resumeInput || !jobInput || !results || !matchScoreEl || !missingKeywordsEl) return;
    const resumeText = resumeInput.value.trim();
    const jobText = jobInput.value.trim();
    if (!resumeText || !jobText) {
      alert("Please paste both your resume and the job description.");
      return;
    }
    const { matchScore, missingKeywords } = compareResume(resumeText, jobText);
    matchScoreEl.textContent = `Match Score: ${matchScore}%`;
    // Clear previous results
    missingKeywordsEl.innerHTML = "";
    if (missingKeywords.length === 0) {
      missingKeywordsEl.innerHTML = "<li>None</li>";
    } else {
      missingKeywords.forEach((keyword) => {
        const li = document.createElement("li");
        li.textContent = keyword;
        missingKeywordsEl.appendChild(li);
      });
    }
    results.classList.remove("hidden");
  });

  // Initialize saved resume features if user is logged in
  initSavedResumesFeature();
});

/**
 * Get the currently logged in user's identifier (email) from localStorage.
 * Returns null if not logged in.
 */
function getCurrentUserEmail() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.email || null;
  } catch (e) {
    return null;
  }
}

/**
 * Initialize saved resume UI and events if a user is logged in.
 */
function initSavedResumesFeature() {
  const email = getCurrentUserEmail();
  const savedSection = document.getElementById("savedResumesSection");
  const saveBtn = document.getElementById("saveResumeBtn");
  const loadBtn = document.getElementById("loadResumeBtn");
  const deleteBtn = document.getElementById("deleteResumeBtn");
  if (!savedSection || !saveBtn || !loadBtn || !deleteBtn) return;
  if (!email) {
    // Hide saved resumes functionality for guests
    savedSection.classList.add("hidden");
    saveBtn.classList.add("hidden");
    return;
  }
  // Show UI
  savedSection.classList.remove("hidden");
  saveBtn.classList.remove("hidden");
  // Load saved resumes into the select element
  loadSavedResumes(email);
  // Attach event listeners for save, load, delete
  saveBtn.addEventListener("click", () => saveCurrentResume(email));
  loadBtn.addEventListener("click", () => loadSelectedResume(email));
  deleteBtn.addEventListener("click", () => deleteSelectedResume(email));
}

/**
 * Load saved resumes from localStorage and populate the select element.
 * @param {string} email
 */
function loadSavedResumes(email) {
  const select = document.getElementById("savedResumesSelect");
  if (!select) return;
  const key = `savedResumes_${email}`;
  const resumes = JSON.parse(localStorage.getItem(key) || "[]");
  // Clear existing options
  select.innerHTML = "";
  resumes.forEach((res, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = res.name;
    select.appendChild(option);
  });
}

/**
 * Save the current resume text to localStorage under the user's saved resumes.
 * Prompts for a name if none provided.
 * @param {string} email
 */
function saveCurrentResume(email) {
  const resumeInput = document.getElementById("resumeInput");
  if (!resumeInput) return;
  const content = resumeInput.value.trim();
  if (!content) {
    alert("There's no resume content to save.");
    return;
  }
  let name = prompt("Enter a name for this resume:");
  if (!name) {
    // Create default name
    const existing = JSON.parse(localStorage.getItem(`savedResumes_${email}`) || "[]");
    name = `Resume ${existing.length + 1}`;
  }
  const key = `savedResumes_${email}`;
  const resumes = JSON.parse(localStorage.getItem(key) || "[]");
  resumes.push({ name, content });
  localStorage.setItem(key, JSON.stringify(resumes));
  loadSavedResumes(email);
  alert(`Saved resume "${name}".`);
}

/**
 * Load the selected saved resume into the resume input.
 * @param {string} email
 */
function loadSelectedResume(email) {
  const select = document.getElementById("savedResumesSelect");
  const resumeInput = document.getElementById("resumeInput");
  if (!select || !resumeInput) return;
  const index = parseInt(select.value, 10);
  if (isNaN(index)) return;
  const key = `savedResumes_${email}`;
  const resumes = JSON.parse(localStorage.getItem(key) || "[]");
  if (resumes[index]) {
    resumeInput.value = resumes[index].content;
  }
}

/**
 * Delete the selected saved resume.
 * @param {string} email
 */
function deleteSelectedResume(email) {
  const select = document.getElementById("savedResumesSelect");
  if (!select) return;
  const index = parseInt(select.value, 10);
  if (isNaN(index)) return;
  const key = `savedResumes_${email}`;
  const resumes = JSON.parse(localStorage.getItem(key) || "[]");
  if (index < 0 || index >= resumes.length) return;
  const [removed] = resumes.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(resumes));
  loadSavedResumes(email);
  alert(`Deleted resume "${removed.name}".`);
}
