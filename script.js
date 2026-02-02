(function () {
  "use strict";

  // Formspree: replace with your form ID from https://formspree.io (create a form, get the id from the endpoint)
  var FORMSPREE_FORM_ID = "xlgldvzj";

  // Carousel
  var CAROUSEL_INTERVAL_MS = 5000;
  var slideCount = 3;
  var currentIndex = 0;
  var carouselTimer = null;

  var carouselTrack = document.querySelector(".carousel-track");
  var slides = document.querySelectorAll(".carousel-slide");
  var prevBtn = document.querySelector(".carousel-prev");
  var nextBtn = document.querySelector(".carousel-next");
  var dots = document.querySelectorAll(".carousel-dots .dot");

  function goToSlide(index) {
    if (index < 0) index = slideCount - 1;
    if (index >= slideCount) index = 0;
    currentIndex = index;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === currentIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === currentIndex);
      dot.setAttribute("aria-selected", i === currentIndex);
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
    resetCarouselTimer();
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
    resetCarouselTimer();
  }

  function resetCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(nextSlide, CAROUSEL_INTERVAL_MS);
  }

  if (prevBtn) prevBtn.addEventListener("click", prevSlide);
  if (nextBtn) nextBtn.addEventListener("click", nextSlide);
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      goToSlide(i);
      resetCarouselTimer();
    });
  });

  goToSlide(0);
  resetCarouselTimer();

  // Enquiry form
  var form = document.getElementById("enquiryForm");
  var nameInput = document.getElementById("name");
  var mobileInput = document.getElementById("mobile");
  var emailInput = document.getElementById("email");
  var addressInput = document.getElementById("address");
  var nameError = document.getElementById("nameError");
  var mobileError = document.getElementById("mobileError");
  var emailError = document.getElementById("emailError");
  var addressError = document.getElementById("addressError");

  function showError(el, msg) {
    if (el) el.textContent = msg || "";
  }

  function setInputInvalid(input, invalid) {
    if (input) input.classList.toggle("invalid", !!invalid);
  }

  function validateForm() {
    var valid = true;
    var name = nameInput ? nameInput.value.trim() : "";
    var mobile = mobileInput ? mobileInput.value.trim().replace(/\s/g, "") : "";
    var email = emailInput ? emailInput.value.trim() : "";
    var address = addressInput ? addressInput.value.trim() : "";
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    showError(nameError, "");
    showError(mobileError, "");
    showError(emailError, "");
    showError(addressError, "");
    setInputInvalid(nameInput, false);
    setInputInvalid(mobileInput, false);
    setInputInvalid(emailInput, false);
    setInputInvalid(addressInput, false);

    if (!name) {
      showError(nameError, "Name is required.");
      setInputInvalid(nameInput, true);
      valid = false;
    }

    if (!mobile) {
      showError(mobileError, "Mobile number is required.");
      setInputInvalid(mobileInput, true);
      valid = false;
    } else if (!/^\d{10}$/.test(mobile)) {
      showError(mobileError, "Enter a valid 10-digit mobile number.");
      setInputInvalid(mobileInput, true);
      valid = false;
    }

    if (!email) {
      showError(emailError, "Email is required.");
      setInputInvalid(emailInput, true);
      valid = false;
    } else if (!emailRegex.test(email)) {
      showError(emailError, "Enter a valid email address.");
      setInputInvalid(emailInput, true);
      valid = false;
    }

    if (!address) {
      showError(addressError, "Address is required.");
      setInputInvalid(addressInput, true);
      valid = false;
    }

    return valid;
  }

  var formStatus = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");

  function setFormStatus(message, isError) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = "form-status " + (isError ? "form-status-error" : "form-status-success");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      var name = nameInput.value.trim();
      var mobile = mobileInput.value.trim().replace(/\s/g, "");
      var email = emailInput ? emailInput.value.trim() : "";
      var address = addressInput.value.trim();

      var payload = {
        name: name,
        mobile: mobile,
        email: email,
        address: address,
        _subject: "Enquiry - Tamil Kitchen",
        _replyto: email
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      setFormStatus("");

      fetch("https://formspree.io/f/" + FORMSPREE_FORM_ID, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json()
            .then(function (data) {
              return { ok: res.ok, status: res.status, data: data };
            })
            .catch(function () {
              return { ok: res.ok, status: res.status, data: null };
            });
        })
        .then(function (result) {
          if (result.ok) {
            setFormStatus("Thank you! We'll get back to you soon.");
            form.reset();
          } else {
            var msg = "Something went wrong. Please try again or contact us directly.";
            if (result.data && result.data.error) {
              msg = result.data.error;
            } else if (result.data && result.data.errors && result.data.errors.length) {
              msg = result.data.errors.map(function (e) { return e.message || e; }).join(". ");
            }
            setFormStatus(msg, true);
          }
        })
        .catch(function (err) {
          setFormStatus("Could not send. Check your connection and try again.", true);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
          }
        });
    });
  }
})();
