const serverList = document.getElementById("server-list");
const downloadedList = document.getElementById("downloaded-list");

document.getElementById("form").addEventListener("submit", function(event){
    event.preventDefault();
    let keyword = document.getElementById("input").value;
    
    fetch(`/search/${encodeURIComponent(keyword)}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ keyword })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка HTTP: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        displayUrls(data);
    })
    .catch(error => {
        alert('Введите torrents или videohosting или search');
    });
});

function displayUrls(urls) {
    downloadedList.innerHTML = "";
    urls.forEach(url => {
        const listItem = document.createElement("li");
        const linkElement = document.createElement("a");
        linkElement.href = "#"; // Устанавливаем href в "#" чтобы избежать перехода
        linkElement.textContent = url;
        linkElement.addEventListener("click", (event) => {
            event.preventDefault();
            downloadContent(url);
        });
        listItem.appendChild(linkElement);
        downloadedList.appendChild(listItem);
    });
}

function downloadContent(url) {
    fetch(`/proxy?url=${encodeURIComponent(url)}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка загрузки: ' + response.status);
        }
        return response.blob();
    })
    .then(blob => {
        const reader = new FileReader();
        reader.onload = function() {
            const base64Data = reader.result.split(',')[1]; // Получаем Base64 часть данных
            localStorage.setItem(url, base64Data);
            console.log('Контент успешно сохранен в LocalStorage');
            addDownloadedSite(url);
        };
        reader.readAsDataURL(blob); // Читаем blob как Data URL
    })
    .catch(error => {
        console.error('Произошла ошибка:', error);
    });
}

function addDownloadedSite(url) {
    const listItem = document.createElement("li");
    const linkElement = document.createElement("a");
    linkElement.href = "#"; // Устанавливаем href в "#" чтобы избежать перехода
    linkElement.textContent = url;
    linkElement.addEventListener("click", (event) => {
        event.preventDefault();
        openContentFromLocalStorage(url);
    });
    listItem.appendChild(linkElement);
    serverList.appendChild(listItem);
}

function openContentFromLocalStorage(url) {
    const storedContent = localStorage.getItem(url);
    if (storedContent) {
        const newWindow = window.open();
        newWindow.document.write("<html><head><title>Content</title></head><body>");
        if (url.endsWith('.mp4')) {
            newWindow.document.write(`<video controls src="data:video/mp4;base64,${storedContent}"></video>`);
        } else if (url.endsWith('.svg')) {
            newWindow.document.write(`<img src="data:image/svg+xml;base64,${storedContent}" />`);
        } else if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
            newWindow.document.write(`<img src="data:image;base64,${storedContent}" />`);
        } else {
            newWindow.document.write(`<pre>${atob(storedContent)}</pre>`);
        }
        newWindow.document.write("</body></html>");
    }
}