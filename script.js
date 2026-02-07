const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzKp3x1SGDVur8QPrfQXbBMv3BqEtgazQKHDcQv4Iz-xi9U7Q-yIk8uhD89JPlIdCtr/exec'; // Replace with your deployed GAS URL
let currentStep = 1;

function updateProgress() {
  const progress = (currentStep / 3) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
}

function nextStep(step) {
  if (!validateStep(step)) return;
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-step="${step + 1}"]`).classList.add('active');
  currentStep++;
  updateProgress();
}

function prevStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-step="${step - 1}"]`).classList.add('active');
  currentStep--;
  updateProgress();
}

function validateStep(step) {
  const fields = document.querySelectorAll(`[data-step="${step}"] [required]`);
  for (let field of fields) {
    if (!field.value.trim()) {
      field.classList.add('is-invalid');
      return false;
    }
    field.classList.remove('is-invalid');
  }
  return true;
}

function setSegmentKey() {
  const mattersMost = document.getElementById('mattersMost').value;
  const segmentMap = {
    'Lower fees': 'fee-conscious',
    'Stability': 'compliance-risk',
    'Growth support': 'growth-focused'
  };
  document.getElementById('segmentKey').value = segmentMap[mattersMost] || 'general';
}

function generateReviewSummary() {
  const formData = new FormData(document.getElementById('quizForm'));
  let summary = '<ul class="list-unstyled">';
  for (let [key, value] of formData.entries()) {
    if (value) summary += `<li><strong>${key}:</strong> ${value}</li>`;
  }
  summary += '</ul>';
  document.getElementById('reviewSummary').innerHTML = summary;
}

document.getElementById('quizForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (currentStep !== 3) {
    alert('Please complete all steps first.');
    return;
  }
  generateReviewSummary();

  // Show simple loading spinner (add this div to HTML as per Step 3)
  const loadingSpinner = document.getElementById('loadingSpinner');
  if (loadingSpinner) loadingSpinner.classList.remove('d-none');

  const formData = new FormData(e.target);
  // Convert to URLSearchParams for GAS compatibility
  const params = new URLSearchParams();
  for (let [key, value] of formData.entries()) {
    params.append(key, value);
  }

  console.log('Submitting...');  // Debug log

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      body: params
    });
    const result = await response.text();
    console.log('Response:', result);  // Debug: Should log "SUCCESS"

    // Hide loading
    if (loadingSpinner) loadingSpinner.classList.add('d-none');

    if (response.ok && result === 'SUCCESS') {
      const successModal = new bootstrap.Modal(document.getElementById('successModal'));
      successModal.show();
      document.getElementById('quizForm').reset();
      currentStep = 1;
      updateProgress();
    } else {
      alert(`Submit failed: ${result || 'Unknown error. Check console.'}`);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    if (loadingSpinner) loadingSpinner.classList.add('d-none');
    alert('Network error. Check console for details.');
  }
});

// GA Tracking (optional)
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID'); // Replace
