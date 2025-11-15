const logindiv = document.getElementById("loginmodal");

// Only do the following if there is infact a login div present.
if (logindiv){
    const loginbuttons = document.querySelectorAll(".loginbutton");

    loginbuttons.forEach((button) => {
        button.addEventListener("click", () => {
            logindiv.classList.toggle("hidden");
        })
        }
        )
    const closeModal = document.querySelector(".closeModal");
        closeModal.addEventListener("click", () => {
            logindiv.classList.toggle("hidden");
        })
}

const signupdiv = document.getElementById("signupmodal");
// Only do the following if there is infact a login div present.
if (logindiv){
    const signupbuttons = document.querySelectorAll(".signupbutton");

    signupbuttons.forEach((button) => {
        button.addEventListener("click", () => {
            signupdiv.classList.toggle("hidden");
        })
        }
        )
    const closeModal = document.querySelector(".closeSignupModal");
        closeModal.addEventListener("click", () => {
            signupdiv.classList.toggle("hidden");
        })
}

// New Folders

const newFolder = document.getElementById("newFolder");
const newFolderDiv = document.getElementById("newFolderDiv");
const closeNewFolderDiv = document.querySelector(".closeNewFolderDiv");

if (newFolder){
    newFolder.addEventListener("click", () => {
        newFolderDiv.classList.toggle("hidden");
    })
    closeNewFolderDiv.addEventListener("click", () => {
    newFolderDiv.classList.toggle("hidden");
})
}

// New Files

const newFileDiv = document.getElementById("newFileDiv");
const newFileDivButton = document.querySelectorAll(".newFileDivButton");

if (newFileDiv){
    newFileDivButton.forEach((button) => {
        button.addEventListener("click", () => {
            newFileDiv.classList.toggle("hidden");
        })
    })
}




