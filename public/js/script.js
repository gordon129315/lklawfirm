$(document).ready(function() {
    $(".will-show").fadeIn(1500);
});

$("#back-to-top").on("click", () => {
    $("body,html").animate({ scrollTop: 0 }, 500);
});
