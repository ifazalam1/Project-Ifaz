const sr = ScrollReveal({
  origin: "top",
  distance: "30px",
  duration: 1000,
  reset: true,
});

sr.reveal(
  `.home_data, .home_img, .column, 
              .about_data, .about_img,
               .main, .input-container, .admin-container, .footer-content`,
  {
    interval: 200,
  }
);
