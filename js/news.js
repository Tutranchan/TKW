    //=================== FIREBASE CONFIG =======================
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    // Firebase Config của bạn
    const firebaseConfig = {
        apiKey: "AIzaSyAMDeuNc7wvxbuCiX1mcM6SFNckofh0d8g",
        authDomain: "wedsite-d28b6.firebaseapp.com",
        projectId: "wedsite-d28b6",
        storageBucket: "wedsite-d28b6.firebasestorage.app",
        messagingSenderId: "895688883914",
        appId: "1:895688883914:web:755cba4660ae7640923e33",
        measurementId: "G-TW862FJ7JK"
    };

    // Khởi tạo Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // ================== 8 ẢNH SLIDER ==================
    let sliderImages = [
        "https://via.placeholder.com/350x180?text=Loading+1",
        "https://via.placeholder.com/350x180?text=Loading+2",
        "https://via.placeholder.com/350x180?text=Loading+3"
    ];

    const sliderWrapper = document.getElementById("sliderWrapper");
    const sliderDots = document.getElementById("sliderDots");

    let sliderPage = 0;
    const perSlide = 3;
    let totalSliderPages = Math.ceil(sliderImages.length / perSlide);

    // tạo ảnh
    function renderSlider() {
        sliderWrapper.innerHTML = "";

        const start = sliderPage * perSlide;
        const viewImages = sliderImages.slice(start, start + perSlide);

        viewImages.forEach(img => {
            sliderWrapper.innerHTML += `
                <div class="slide-item">
                    <img src="${img}">
                </div>
            `;
        });

        renderSliderDots();
    }

    // tạo dấu chấm
    function renderSliderDots() {
        sliderDots.innerHTML = "";

        for (let i = 0; i < totalSliderPages; i++) {
            const dot = document.createElement("span");
            dot.className = "slider-dot" + (i === sliderPage ? " active" : "");
            dot.onclick = () => {
                sliderPage = i;
                renderSlider();
            };
            sliderDots.appendChild(dot);
        }
    }

    // auto slide
    let sliderInterval = setInterval(() => {
        sliderPage = (sliderPage + 1) % totalSliderPages;
        renderSlider();
    }, 3500);

    // Hàm update slider khi có dữ liệu mới
    function updateSliderImages(images) {
        sliderImages = images;
        totalSliderPages = Math.ceil(sliderImages.length / perSlide);
        sliderPage = 0;
        
        // Reset interval
        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => {
            sliderPage = (sliderPage + 1) % totalSliderPages;
            renderSlider();
        }, 3500);
        
        renderSlider();
    }

    renderSlider();

    // ================== DỮ LIỆU TIN TỪ FIREBASE ==================
    let data = [];
    let currentTab = "latest";
    let currentPage = 1;

    // HÀM LẤY DỮ LIỆU TỪ FIREBASE
    async function loadDataFromFirebase() {
        try {
            const newsBox = document.getElementById("newsList");
            newsBox.innerHTML = "<p style='text-align:center; padding:40px; color:#fff;'>⏳ Đang tải dữ liệu từ Firebase...</p>";

            // Lấy dữ liệu từ collection "events"
            const eventsRef = collection(db, "events");
            const q = query(eventsRef, orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);

            data = [];
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                data.push({
                    id: doc.id,
                    title: docData.title || "Không có tiêu đề",
                    type: docData.type || "event",
                    date: docData.date || "",
                    img: docData.img || "https://via.placeholder.com/400x200?text=No+Image",
                    desc: docData.desc || ""
                });
            });

            console.log("✅ Đã tải", data.length, "sự kiện từ Firebase");
            console.log("📊 Dữ liệu:", data);

            // Lấy 8 ảnh đầu tiên cho slider
            const sliderimgs = data.slice(0, 8).map(item => item.img);
            if (sliderimgs.length > 0) {
                updateSliderImages(sliderimgs);
                console.log("🖼️ Đã cập nhật", sliderimgs.length, "ảnh cho slider");
            }

            if (data.length === 0) {
                newsBox.innerHTML = "<p style='text-align:center; padding:40px; color:#ffd700;'>⚠️ Collection 'events' trống. Vui lòng thêm dữ liệu vào Firestore.</p>";
            } else {
                applyFilter();
            }

        } catch (error) {
            console.error("❌ Lỗi khi tải dữ liệu:", error);
            document.getElementById("newsList").innerHTML = 
                `<p style='text-align:center; padding:40px; color:red;'>
                    ❌ Lỗi: ${error.message}<br><br>
                    Vui lòng kiểm tra:<br>
                    1. Firestore Database đã được kích hoạt chưa?<br>
                    2. Collection "events" đã tồn tại chưa?<br>
                    3. Firestore Rules có cho phép đọc không?
                </p>`;
        }
    }

    // TABS
    document.querySelectorAll(".tab").forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            currentTab = tab.dataset.tab;
            currentPage = 1;
            applyFilter();
        };
    });

    // LIST
    function renderNews(list) {
        const box = document.getElementById("newsList");

        box.innerHTML = list.length
            ? list.map(item => `
                <div class="news-card" onclick="openDetail('${item.id}')">
                    <img src="${item.img}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x200?text=Error'">
                    <div>
                        <h3>${item.title}</h3>
                        <p style="font-size:0.9em; opacity:0.7; margin-top:5px;">${item.desc || ''}</p>
                        <div style="margin-top:10px; color:#ffd700;">${item.date}</div>
                    </div>
                </div>
            `).join("")
            : "<p style='text-align:center; padding:40px; color:#fff;'>📭 Không có dữ liệu cho mục này.</p>";
    }

    // PAGINATION
    function renderPagination(totalPages) {
        const dotBox = document.querySelector(".page-dots");
        const leftBtn = document.querySelector(".page-btn.left");
        const rightBtn = document.querySelector(".page-btn.right");

        dotBox.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const dot = document.createElement("span");
            dot.className = "dot" + (i === currentPage ? " active" : "");
            dot.textContent = i;

            dot.onclick = () => {
                currentPage = i;
                applyFilter();
            };

            dotBox.appendChild(dot);
        }

        leftBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                applyFilter();
            }
        };

        rightBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                applyFilter();
            }
        };
    }

    // FILTER
    function applyFilter() {
        let filtered = currentTab === "latest" ? [...data] : data.filter(d => d.type === currentTab);

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        const perPage = 3;
        const totalPages = Math.ceil(filtered.length / perPage) || 1;

        const start = (currentPage - 1) * perPage;
        const paginated = filtered.slice(start, start + perPage);

        renderNews(paginated);
        renderPagination(totalPages);
    }

    function openDetail(id) {
        console.log("Mở chi tiết sự kiện:", id);
        window.location.href = "detail.html?id=" + id;
    }

    // ✅ KHỞI ĐỘNG: Load dữ liệu từ Firebase khi trang load xong
    console.log("🚀 Đang kết nối Firebase...");
    loadDataFromFirebase();