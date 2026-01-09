let currentUser = null;
let selectedRating = 0;
let totalDownloads = 0;

document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  setupNavigation();
  setupDownloadButtons();
  setupSmoothScroll();
  setupReviewSystem();
  loadReviews();
  loadDownloadStats();

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      handleUserLogin(user);
    } else {
      handleUserLogout();
    }
  });
}

function setupNavigation() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });
  }

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      navMenu.classList.remove("active");
    });
  });

  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

function setupDownloadButtons() {
  const downloadBtn1 = document.getElementById("downloadBtn");
  const downloadBtn2 = document.getElementById("downloadBtn2");

  if (downloadBtn1) {
    downloadBtn1.addEventListener("click", handleDownload);
  }
  if (downloadBtn2) {
    downloadBtn2.addEventListener("click", handleDownload);
  }
}

async function handleDownload() {
  try {
    await incrementDownloadCount();

    showToast("Download dimulai... Terima kasih!");

    const apkUrl =
      "https://github.com/rafly24/web-porto/releases/download/lapor-in/lapor-in.apk";

    const link = document.createElement("a");
    link.href = apkUrl;
    link.download = "lapor-in.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Download initiated");
  } catch (error) {
    console.error("Error during download:", error);
    showToast("Terjadi kesalahan. Silakan coba lagi.");
  }
}

async function incrementDownloadCount() {
  try {
    const statsRef = firebase.firestore().collection("stats").doc("downloads");

    await firebase.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(statsRef);

      if (!doc.exists) {
        transaction.set(statsRef, { count: 1 });
      } else {
        const newCount = (doc.data().count || 0) + 1;
        transaction.update(statsRef, { count: newCount });
      }
    });

    loadDownloadStats();
  } catch (error) {
    console.error("Error incrementing download count:", error);
  }
}

async function loadDownloadStats() {
  try {
    const statsRef = firebase.firestore().collection("stats").doc("downloads");
    const doc = await statsRef.get();

    if (doc.exists) {
      const count = doc.data().count || 0;
      totalDownloads = count;
      document.getElementById("totalDownloads").textContent = count;
    } else {
      document.getElementById("totalDownloads").textContent = "0";
    }
  } catch (error) {
    console.error("Error loading download stats:", error);
    document.getElementById("totalDownloads").textContent = "0";
  }
}

function setupReviewSystem() {
  const loginBtn = document.getElementById("loginBtn");
  const loginGoogleBtn = document.getElementById("loginGoogleBtn");
  const submitReviewBtn = document.getElementById("submitReview");
  const starRating = document.getElementById("starRating");

  if (loginBtn) {
    loginBtn.addEventListener("click", handleGoogleLogin);
  }
  if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener("click", handleGoogleLogin);
  }
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", submitReview);
  }

  if (starRating) {
    const stars = starRating.querySelectorAll("i");
    stars.forEach((star) => {
      star.addEventListener("click", function () {
        selectedRating = parseInt(this.getAttribute("data-rating"));
        updateStarDisplay(stars, selectedRating);
      });

      star.addEventListener("mouseenter", function () {
        const rating = parseInt(this.getAttribute("data-rating"));
        updateStarDisplay(stars, rating);
      });
    });

    starRating.addEventListener("mouseleave", function () {
      updateStarDisplay(stars, selectedRating);
    });
  }
}

function updateStarDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.remove("far");
      star.classList.add("fas", "active");
    } else {
      star.classList.remove("fas", "active");
      star.classList.add("far");
    }
  });
}

async function handleGoogleLogin() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    showToast("Login berhasil!");
  } catch (error) {
    console.error("Error during login:", error);
    showToast("Login gagal. Silakan coba lagi.");
  }
}

function handleUserLogin(user) {
  currentUser = user;

  const loginBtn = document.getElementById("loginBtn");
  const addReviewSection = document.getElementById("addReviewSection");
  const reviewForm = document.getElementById("reviewForm");
  const loginGoogleBtn = document.getElementById("loginGoogleBtn");

  if (loginBtn) {
    loginBtn.innerHTML = `
            <img src="${user.photoURL}" alt="${user.displayName}" 
                 style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">
            ${user.displayName.split(" ")[0]}
        `;
    loginBtn.onclick = handleLogout;
  }

  if (addReviewSection) {
    addReviewSection.style.display = "block";
  }

  checkExistingReview(user.email);
  if (reviewForm) {
    reviewForm.style.display = "block";
  }
  if (loginGoogleBtn) {
    loginGoogleBtn.style.display = "none";
  }
}

function handleUserLogout() {
  currentUser = null;

  const loginBtn = document.getElementById("loginBtn");
  const reviewForm = document.getElementById("reviewForm");
  const loginGoogleBtn = document.getElementById("loginGoogleBtn");

  if (loginBtn) {
    loginBtn.innerHTML = '<i class="fab fa-google"></i> Login';
    loginBtn.onclick = handleGoogleLogin;
  }

  if (reviewForm) {
    reviewForm.style.display = "none";
  }
  if (loginGoogleBtn) {
    loginGoogleBtn.style.display = "inline-flex";
  }
}

async function handleLogout() {
  try {
    await firebase.auth().signOut();
    showToast("Logout berhasil");
  } catch (error) {
    console.error("Error during logout:", error);
  }
}

async function checkExistingReview(userEmail) {
  try {
    const reviewForm = document.getElementById("reviewForm");
    const loginGoogleBtn = document.getElementById("loginGoogleBtn");

    if (!reviewForm) return;

    const snapshot = await firebase
      .firestore()
      .collection("reviews")
      .where("userEmail", "==", userEmail)
      .get();

    if (!snapshot.empty) {
      const reviewDoc = snapshot.docs[0];
      const reviewData = reviewDoc.data();
      const reviewId = reviewDoc.id;

      selectedRating = reviewData.rating;
      const stars = document.querySelectorAll("#starRating i");
      updateStarDisplay(stars, selectedRating);
      document.getElementById("reviewText").value = reviewData.text;

      reviewForm.innerHTML = `
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 1.5rem; border-radius: 12px; color: white; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
            <img src="${reviewData.userPhoto}" alt="${reviewData.userName}" 
                 style="width: 40px; height: 40px; border-radius: 50%;">
            <div>
              <h3 style="margin: 0; font-size: 1.1rem;">${
                reviewData.userName
              }</h3>
              <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Berikan rating Anda</p>
            </div>
          </div>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 12px; border: 2px solid #e5e7eb;">
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #1f2937;">Rating Anda</label>
            <div id="starRating" style="font-size: 2rem; color: #fbbf24; cursor: pointer;">
              ${[1, 2, 3, 4, 5]
                .map(
                  (i) =>
                    `<i class="fa${
                      i <= reviewData.rating ? "s" : "r"
                    } fa-star" data-rating="${i}"></i>`
                )
                .join("")}
            </div>
            <p style="margin-top: 0.5rem; color: #6b7280; font-size: 0.9rem;">Sangat Bagus 😊</p>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #1f2937;">Komentar</label>
            <textarea id="reviewText" 
                      style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; min-height: 100px; resize: vertical;"
                      placeholder="Bagikan pengalaman Anda menggunakan aplikasi Lapor.in...">${
                        reviewData.text
                      }</textarea>
          </div>
          
          <div style="display: flex; gap: 0.75rem;">
            <button onclick="updateReview('${reviewId}')" 
                    style="flex: 1; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <i class="fas fa-sync-alt"></i> Update
            </button>
            <button onclick="deleteReview('${reviewId}')" 
                    style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      `;

      const newStarRating = document.getElementById("starRating");
      if (newStarRating) {
        const newStars = newStarRating.querySelectorAll("i");
        newStars.forEach((star) => {
          star.addEventListener("click", function () {
            selectedRating = parseInt(this.getAttribute("data-rating"));
            updateStarDisplay(newStars, selectedRating);
          });
        });
      }
    } else {
      reviewForm.style.display = "block";
      if (loginGoogleBtn) {
        loginGoogleBtn.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error checking existing review:", error);
  }
}

async function updateReview(reviewId) {
  if (!currentUser) {
    showToast("Silakan login terlebih dahulu");
    return;
  }

  if (selectedRating === 0) {
    showToast("Silakan pilih rating");
    return;
  }

  const reviewText = document.getElementById("reviewText").value.trim();
  if (!reviewText) {
    showToast("Silakan tulis ulasan Anda");
    return;
  }

  try {
    await firebase.firestore().collection("reviews").doc(reviewId).update({
      rating: selectedRating,
      text: reviewText,
      updatedAt: new Date().toISOString(),
    });

    showToast("Ulasan berhasil diperbarui!");
    loadReviews();
  } catch (error) {
    console.error("Error updating review:", error);
    showToast("Gagal memperbarui ulasan. Silakan coba lagi.");
  }
}

async function deleteReview(reviewId) {
  if (!currentUser) {
    showToast("Silakan login terlebih dahulu");
    return;
  }

  if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) {
    return;
  }

  try {
    await firebase.firestore().collection("reviews").doc(reviewId).delete();

    showToast("Ulasan berhasil dihapus!");

    document.getElementById("reviewText").value = "";
    selectedRating = 0;
    const stars = document.querySelectorAll("#starRating i");
    if (stars.length > 0) {
      updateStarDisplay(stars, 0);
    }

    loadReviews();
    location.reload();
  } catch (error) {
    console.error("Error deleting review:", error);
    showToast("Gagal menghapus ulasan. Silakan coba lagi.");
  }
}

async function submitReview() {
  if (!currentUser) {
    showToast("Silakan login terlebih dahulu");
    return;
  }

  if (selectedRating === 0) {
    showToast("Silakan pilih rating");
    return;
  }

  const reviewText = document.getElementById("reviewText").value.trim();
  if (!reviewText) {
    showToast("Silakan tulis ulasan Anda");
    return;
  }

  try {
    const existingReview = await firebase
      .firestore()
      .collection("reviews")
      .where("userEmail", "==", currentUser.email)
      .get();

    if (!existingReview.empty) {
      showToast(
        "Anda sudah memberikan ulasan. Gunakan tombol Update untuk mengubahnya."
      );
      return;
    }

    const review = {
      userId: currentUser.uid,
      userName: currentUser.displayName,
      userPhoto: currentUser.photoURL,
      userEmail: currentUser.email,
      rating: selectedRating,
      text: reviewText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
    };

    await firebase.firestore().collection("reviews").add(review);

    showToast("Terima kasih atas ulasan Anda!");

    document.getElementById("reviewText").value = "";
    selectedRating = 0;
    const stars = document.querySelectorAll("#starRating i");
    updateStarDisplay(stars, 0);

    loadReviews();
    checkExistingReview(currentUser.email);
  } catch (error) {
    console.error("Error submitting review:", error);
    showToast("Gagal mengirim ulasan. Silakan coba lagi.");
  }
}

async function loadReviews() {
  try {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    const snapshot = await firebase
      .firestore()
      .collection("reviews")
      .orderBy("timestamp", "desc")
      .limit(4)
      .get();

    if (snapshot.empty) {
      reviewsList.innerHTML = `
        <div class="no-reviews" style="text-align: center; padding: 3rem; color: var(--gray);">
          <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
          <p>Belum ada ulasan. Jadilah yang pertama memberikan review!</p>
        </div>
      `;
      return;
    }

    reviewsList.innerHTML = "";

    snapshot.forEach((doc) => {
      const review = doc.data();
      const reviewCard = createReviewCard(review);
      reviewsList.appendChild(reviewCard);
    });

    const totalCount = await firebase.firestore().collection("reviews").get();
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) {
      loadMoreBtn.style.display = totalCount.size > 0 ? "flex" : "none";
    }

    updateOverallRating();
  } catch (error) {
    console.error("Error loading reviews:", error);
    const reviewsList = document.getElementById("reviewsList");
    if (reviewsList) {
      reviewsList.innerHTML = `
        <div class="no-reviews" style="text-align: center; padding: 3rem; color: var(--gray);">
          <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
          <p>Belum ada ulasan. Jadilah yang pertama memberikan review!</p>
        </div>
      `;
    }
  }
}

function createReviewCard(review) {
  const card = document.createElement("div");
  card.className = "review-card";

  const initials = review.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
  const timeAgo = review.createdAt || getTimeAgo(review.timestamp);

  const starsHtml = Array(5)
    .fill(0)
    .map((_, i) => {
      return i < review.rating
        ? '<i class="fas fa-star"></i>'
        : '<i class="far fa-star"></i>';
    })
    .join("");

  card.innerHTML = `
        <div class="review-header">
            <div class="review-avatar">${initials}</div>
            <div class="review-info">
                <h4>${review.userName}</h4>
                <div class="review-rating">
                    <div class="review-stars">${starsHtml}</div>
                    <span class="review-badge">${review.rating}.0</span>
                </div>
            </div>
            <div class="review-time">${timeAgo}</div>
        </div>
        <p class="review-text">${review.text}</p>
    `;

  return card;
}

async function updateOverallRating() {
  try {
    const snapshot = await firebase.firestore().collection("reviews").get();

    if (snapshot.empty) {
      document.getElementById("overallScore").textContent = "0";
      document.getElementById("reviewCount").textContent = "0 reviews";
      document.getElementById("averageRating").textContent = "0";
      document.getElementById("totalReports").textContent = "0";

      const overallStars = document.getElementById("overallStars");
      if (overallStars) {
        overallStars.innerHTML = `
          <i class="far fa-star"></i>
          <i class="far fa-star"></i>
          <i class="far fa-star"></i>
          <i class="far fa-star"></i>
          <i class="far fa-star"></i>
        `;
      }

      for (let i = 1; i <= 5; i++) {
        const barFill = document.getElementById(`bar-${i}`);
        const barCount = document.getElementById(`count-${i}`);
        if (barFill) barFill.style.width = "0%";
        if (barCount) barCount.textContent = "0";
      }
      return;
    }

    let totalRating = 0;
    const ratingCounts = [0, 0, 0, 0, 0];

    snapshot.forEach((doc) => {
      const review = doc.data();
      totalRating += review.rating;
      ratingCounts[review.rating - 1]++;
    });

    const totalReviews = snapshot.size;
    const averageRating = (totalRating / totalReviews).toFixed(1);

    document.getElementById("overallScore").textContent = averageRating;
    document.getElementById(
      "reviewCount"
    ).textContent = `${totalReviews} reviews`;
    document.getElementById("averageRating").textContent = averageRating;
    document.getElementById("totalReports").textContent = totalReviews;

    const overallStars = document.getElementById("overallStars");
    if (overallStars) {
      const fullStars = Math.floor(averageRating);
      let starsHtml = "";
      for (let i = 1; i <= 5; i++) {
        starsHtml +=
          i <= fullStars
            ? '<i class="fas fa-star"></i>'
            : '<i class="far fa-star"></i>';
      }
      overallStars.innerHTML = starsHtml;
    }

    const totalCount = totalReviews;
    ratingCounts.forEach((count, index) => {
      const ratingNum = index + 1;
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
      const barFill = document.getElementById(`bar-${ratingNum}`);
      const barCount = document.getElementById(`count-${ratingNum}`);
      if (barFill) barFill.style.width = percentage + "%";
      if (barCount) barCount.textContent = count;
    });
  } catch (error) {
    console.error("Error updating overall rating:", error);
  }
}

function getTimeAgo(timestamp) {
  if (!timestamp) return "Baru saja";

  const now = new Date();
  const reviewDate = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);
  const diff = now - reviewDate;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 30) return `${days} hari lalu`;
  return reviewDate.toLocaleDateString("id-ID");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

// Screenshot Carousel Functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    if (dots[i]) {
      dots[i].classList.remove("active");
    }
  });

  if (slides[index]) {
    slides[index].classList.add("active");
  }
  if (dots[index]) {
    dots[index].classList.add("active");
  }

  currentSlide = index;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

// Initialize carousel
if (document.getElementById("nextBtn")) {
  document.getElementById("nextBtn").addEventListener("click", nextSlide);
}

if (document.getElementById("prevBtn")) {
  document.getElementById("prevBtn").addEventListener("click", prevSlide);
}

// Dot navigation
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
  });
});

// Auto-play carousel
let autoPlayInterval = setInterval(nextSlide, 5000);

// Pause on hover
const carouselTrack = document.querySelector(".carousel-track");
if (carouselTrack) {
  carouselTrack.addEventListener("mouseenter", () => {
    clearInterval(autoPlayInterval);
  });

  carouselTrack.addEventListener("mouseleave", () => {
    autoPlayInterval = setInterval(nextSlide, 5000);
  });
}
