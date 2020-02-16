$('form').on("submit", (e) => {
    e.preventDefault();
    
    fetch("/send-email", {
        method: 'POST',
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: $(e.target).serialize(),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.err) {
                return alert(data.err);
            }
            alert('Successfully sent!\nWe will reply within 2 business days. Thanks!');
            $(e.target).trigger("reset"); 
        })
        .catch((err) => console.log(err));
});
