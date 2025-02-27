let songs = [];
let currentIndex = 0;
let selectedIndex = -1; // Variable to track selected suggestion
let audio = document.getElementById("audioPlayer");
let playIcon = document.getElementById("playIcon");
let mobileAudio = document.getElementById("mobileAudioPlayer");
let playIconMobile = document.getElementById("playIconMobile");
async function loadSongs() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Không thể tải dữ liệu");
    songs = await response.json();
    document.getElementById("totalSongs").textContent = songs.length;
    document.getElementById("totalSongsDisplay").textContent = songs.length;
    displayArtistsAndSongs();
    displaySong();
  } catch (error) {
    console.error("Lỗi tải bài hát:", error);
  }
}
function displayArtistsAndSongs() {
  let artists = [...new Set(songs.map((song) => song.artist))];
  const renderArtistSongList = (elementId, hideSongs = false) => {
    let artistSongList = document.getElementById(elementId);
    artistSongList.innerHTML = artists
      .map((artist) => {
        let artistSongs = songs.filter((song) => song.artist === artist);
        let songItems = artistSongs
          .map(
            (song) =>
              `<li class='list-group-item ps-4' onclick="displaySongByTitle('${song.title}')">${song.title}</li>`
          )
          .join("");
        return `
    <li class='list-group-item fw-bold d-flex justify-content-between' onclick="toggleSongs('${artist}')">
      ${artist} <span class='badge bg-primary'>${artistSongs.length}</span>
    </li>
    <ul class='list-unstyled song-list ${
      hideSongs ? "" : ""
    }' id='songs-${artist}'>
      ${songItems}
    </ul>
  `;
      })
      .join("");
  };
  renderArtistSongList("artistSongList", true); // Danh sách chính
  renderArtistSongList("offcanvasArtistSongList"); // Offcanvas
}
function toggleSongs(artist) {
  document.querySelectorAll(".song-list").forEach((list) => {
    list.id === `songs-${artist}`
      ? list.classList.toggle("show") // Mở/đóng danh sách được chọn
      : list.classList.remove("show"); // Thu gọn các danh sách khác
  });
}

function displaySong() {
  if (songs.length === 0) return;
  const song = songs[currentIndex];
  document.getElementById("songTitle").textContent = song.title;
  document.getElementById("songArtist").textContent = song.artist;
  document.getElementById("songLyrics").innerHTML = song.lyrics;
  document.getElementById("songNumber").textContent = song.number;
  document.getElementById("songRating").textContent = song.rating;
  document.getElementById("songYear").textContent = song.year;
  const songLink = document.getElementById("songLink");
  songLink.innerHTML = `<a href="${song.link}" target="_blank">${song.link}</a>`;
  document.getElementById("songDescription").textContent = song.description;
  document.getElementById("audioPlayer").src = song.official;
  document.getElementById("mobileAudioPlayer").src = song.official;
}
function searchSong(event) {
  let input = event.target.value.toLowerCase();
  let suggestionsList = document.getElementById("suggestionsList");
  suggestionsList.innerHTML = "";
  if (input) {
    let filteredSongs = songs.filter((song) =>
      song.title.toLowerCase().includes(input)
    );

    filteredSongs.forEach((song) => {
      let listItem = document.createElement("li");
      listItem.textContent = song.title;
      listItem.onclick = () => displaySongByTitle(song.title);
      suggestionsList.appendChild(listItem);
    });

    suggestionsList.style.display = "block";
  } else {
    suggestionsList.style.display = "none";
  }
}
function handleKeyPress(event) {
  let suggestionsList = document.getElementById("suggestionsList");
  let items = suggestionsList.getElementsByTagName("li");

  if (event.key === "ArrowDown") {
    selectedIndex = Math.min(items.length - 1, selectedIndex + 1);
  } else if (event.key === "ArrowUp") {
    selectedIndex = Math.max(0, selectedIndex - 1);
  } else if (event.key === "Enter" && selectedIndex !== -1) {
    items[selectedIndex].click();
  }

  for (let i = 0; i < items.length; i++) {
    items[i].classList.toggle("selected", i === selectedIndex);
  }
}
document
  .getElementById("searchInput")
  .addEventListener("keydown", handleKeyPress);

loadSongs();

function syncIcons(isPlaying) {
  if (isPlaying) {
    playIcon.classList.remove("fa-play");
    playIcon.classList.add("fa-pause");
    playIconMobile.classList.remove("fa-play");
    playIconMobile.classList.add("fa-pause");
  } else {
    playIcon.classList.remove("fa-pause");
    playIcon.classList.add("fa-play");
    playIconMobile.classList.remove("fa-pause");
    playIconMobile.classList.add("fa-play");
  }
}

// Cập nhật lại hàm toggleAudio để hoạt động đúng cho tất cả các bài hát
function toggleAudio() {
  if (!audio || (!playIcon && !mobileAudio)) return;

  if (audio.paused || audio.ended) {
    audio.play();
    if (mobileAudio) mobileAudio.play();
    if (playIcon) {
      playIcon.classList.remove("fa-play");
      playIcon.classList.add("fa-pause");
    }
    if (typeof syncIcons === "function") syncIcons(true);
  } else {
    audio.pause();
    if (mobileAudio) mobileAudio.pause();
    if (playIcon) {
      playIcon.classList.remove("fa-pause");
      playIcon.classList.add("fa-play");
    }
    if (typeof syncIcons === "function") syncIcons(false);
  }
}

// Cho điện thoại
function toggleAudioMobile() {
  if (!audio || !mobileAudio) return;

  if (mobileAudio.paused || mobileAudio.ended) {
    mobileAudio.play();
    audio.play();
    if (playIconMobile) {
      playIconMobile.classList.remove("fa-play");
      playIconMobile.classList.add("fa-pause");
    }
    if (typeof syncIcons === "function") syncIcons(true);
  } else {
    mobileAudio.pause();
    audio.pause();
    if (playIconMobile) {
      playIconMobile.classList.remove("fa-pause");
      playIconMobile.classList.add("fa-play");
    }
    if (typeof syncIcons === "function") syncIcons(false);
  }
}

// Khi phát bài mới, đảm bảo icon cập nhật đúng
function playSong(songUrl) {
  if (!songUrl) return;

  // Đặt src mới và reset thời gian
  audio.src = songUrl;
  mobileAudio.src = songUrl;
  audio.currentTime = 0;
  mobileAudio.currentTime = 0;

  // Phát nhạc
  audio.play().catch((err) => console.error("Lỗi phát nhạc:", err));
  mobileAudio
    .play()
    .catch((err) => console.error("Lỗi phát nhạc trên điện thoại:", err));

  // Cập nhật icon
  playIcon.classList.remove("fa-play");
  playIcon.classList.add("fa-pause");
  playIconMobile.classList.remove("fa-play");
  playIconMobile.classList.add("fa-pause");
}

// Sự kiện khi bài hát kết thúc -> cập nhật icon
audio.addEventListener("ended", () => {
  playIcon.classList.remove("fa-pause");
  playIcon.classList.add("fa-play");
});

mobileAudio.addEventListener("ended", () => {
  playIconMobile.classList.remove("fa-pause");
  playIconMobile.classList.add("fa-play");
});

// Chuyển bài khi click vào tiêu đề
function displaySongByTitle(title) {
  let song = songs.find((song) => song.title === title);
  if (!song) return;

  currentIndex = songs.indexOf(song);
  displaySong();
  playSong(song.official); // Phát bài mới
}

// Hàm phát bài ngẫu nhiên
function playRandomSong() {
  if (songs.length === 0) return;
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * songs.length);
  } while (randomIndex === currentIndex);
  currentIndex = randomIndex;
  displaySong();
  audio.currentTime = 0; // Reset thời gian bài hát về 0
  mobileAudio.currentTime = 0;
  audio.play().catch((err) => console.error(err));
  mobileAudio.play().catch((err) => console.error("Lỗi phát nhạc:", err));
  playIcon.classList.remove("fa-play");
  playIcon.classList.add("fa-pause");
  playIconMobile.classList.remove("fa-play");
  playIconMobile.classList.add("fa-pause");
}
// Sự kiện khi bài hát kết thúc -> phát bài ngẫu nhiên
audio.addEventListener("ended", playRandomSong);
mobileAudio.addEventListener("ended", playRandomSong);
