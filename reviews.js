let allReviews = [];
let filteredReviews = [];

document.addEventListener("DOMContentLoaded", function () {
  initializeReviewsPage();
});

function initializeReviewsPage() {
  setupNavigation();
  loadAllReviews();
  setupFilters();

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

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", handleGoogleLogin);
  }
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
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.innerHTML = `
      <img src="${user.photoURL}" alt="${user.displayName}" 
           style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">
      ${user.displayName.split(" ")[0]}
    `;
    loginBtn.onclick = handleLogout;
  }
}

function handleUserLogout() {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.innerHTML = '<i class="fab fa-google"></i> Login';
    loginBtn.onclick = handleGoogleLogin;
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

async function loadAllReviews() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  const reviewsGrid = document.getElementById("reviewsGrid");
  const noReviews = document.getElementById("noReviews");

  try {
    loadingSpinner.style.display = "block";
    reviewsGrid.style.display = "none";
    noReviews.style.display = "none";

    const snapshot = await firebase
      .firestore()
      .collection("reviews")
      .orderBy("timestamp", "desc")
      .get();

    loadingSpinner.style.display = "none";

    if (snapshot.empty) {
      noReviews.style.display = "block";
      return;
    }

    allReviews = [];
    snapshot.forEach((doc) => {
      allReviews.push({ id: doc.id, ...doc.data() });
    });

    filteredReviews = [...allReviews];
    displayReviews(filteredReviews);
    updateStats(allReviews);
    reviewsGrid.style.display = "grid";
  } catch (error) {
    console.error("Error loading reviews:", error);
    loadingSpinner.style.display = "none";
    noReviews.style.display = "block";
  }
}

function displayReviews(reviews) {
  const reviewsGrid = document.getElementById("reviewsGrid");
  const noReviews = document.getElementById("noReviews");

  if (reviews.length === 0) {
    reviewsGrid.style.display = "none";
    noReviews.style.display = "block";
    return;
  }

  reviewsGrid.style.display = "grid";
  noReviews.style.display = "none";
  reviewsGrid.innerHTML = "";

  reviews.forEach((review) => {
    const reviewCard = createReviewCard(review);
    reviewsGrid.appendChild(reviewCard);
  });
}

function createReviewCard(review) {
  const card = document.createElement("div");
  card.className = "review-card";

  const initials = review.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
  const timeAgo = getTimeAgo(review.timestamp || review.createdAt);

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

function updateStats(reviews) {
  const totalCount = reviews.length;
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : 0;

  document.getElementById("totalReviewsCount").textContent = totalCount;
  document.getElementById("averageRatingValue").textContent = avgRating;
  document.getElementById("fiveStarCount").textContent = fiveStarCount;
}

function setupFilters() {
  const searchInput = document.getElementById("searchInput");
  const ratingFilter = document.getElementById("ratingFilter");
  const sortFilter = document.getElementById("sortFilter");

  searchInput.addEventListener("input", applyFilters);
  ratingFilter.addEventListener("change", applyFilters);
  sortFilter.addEventListener("change", applyFilters);
}

function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const ratingFilter = document.getElementById("ratingFilter").value;
  const sortFilter = document.getElementById("sortFilter").value;

  filteredReviews = allReviews.filter((review) => {
    const matchesSearch =
      review.userName.toLowerCase().includes(searchTerm) ||
      review.text.toLowerCase().includes(searchTerm);

    const matchesRating =
      ratingFilter === "all" || review.rating === parseInt(ratingFilter);

    return matchesSearch && matchesRating;
  });

  switch (sortFilter) {
    case "newest":
      filteredReviews.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.createdAt);
        const timeB = b.timestamp?.toDate?.() || new Date(b.createdAt);
        return timeB - timeA;
      });
      break;
    case "oldest":
      filteredReviews.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.createdAt);
        const timeB = b.timestamp?.toDate?.() || new Date(b.createdAt);
        return timeA - timeB;
      });
      break;
    case "highest":
      filteredReviews.sort((a, b) => b.rating - a.rating);
      break;
    case "lowest":
      filteredReviews.sort((a, b) => a.rating - b.rating);
      break;
  }

  displayReviews(filteredReviews);
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
