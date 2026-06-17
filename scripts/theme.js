const themeToggle = document.getElementById('themeToggle'); // Your button ID

// Check local storage so the preference stays when they refresh page
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    // Toggle the class on the body
    document.body.classList.toggle('dark-mode');
    
    // Save to local storage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'auto');
    }
});
