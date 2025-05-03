const snowflakesCount = 50;
const body = document.body;

for (let i = 0; i < snowflakesCount; i++) {
    const snowflake = document.createElement("div");
    snowflake.innerHTML = "❄";
    snowflake.style.position = "fixed";
    snowflake.style.left = Math.random() * 100 + "vw";
    snowflake.style.top = "-20px";
    snowflake.style.fontSize = Math.random() * 20 + 10 + "px";
    snowflake.style.opacity = Math.random();
    snowflake.style.animation = `fall ${Math.random() * 5 + 3}s linear infinite`;
    snowflake.style.userSelect = "none";
    snowflake.style.pointerEvents = "none";
    body.appendChild(snowflake);
}

// Добавляем анимацию падения
const style = document.createElement("style");
style.innerHTML = `
    @keyframes fall {
        to {
            transform: translateY(100vh);
        }
    }
`;
document.head.appendChild(style);