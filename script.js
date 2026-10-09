//
//Student Management Project
//

console.log("Student Management Project started....")
const API_URL = "http://localhost:3000/students"
//DOM Elements
let studentName = document.getElementById("studentName")
let studentCourse = document.getElementById("studentCourse")
let studentEmail = document.getElementById("studentEmail")
let addStudentBtn = document.getElementById("addStudentBtn")
let studentContainer = document.getElementById("studentContainer")
let searchStudent = document.getElementById("searchStudent")
let totalStudents = document.getElementById("totalStudents")
let totalCourses = document.getElementById("totalCourses")
let sortStudents = document.getElementById("sortStudents")
const nameError = document.getElementById("nameError")
const courseError = document.getElementById("courseError")
const emailError = document.getElementById("emailError")
let studentForm = document.getElementById("studentForm")
//data store
let students = []

//student id
let editingStudentId = null;

//event Listener
//addStudentBtn.addEventListener("click", addStudent);
searchStudent.addEventListener("input", searchStudents)
sortStudents.addEventListener("change", sortStudentList)
studentForm.addEventListener("submit", async function (event) {
    event.preventDefault()
    if (editingStudentId !== null) {
        await updateStudent()
    }else{
        addStudent()
    }
})
//add student
async function addStudent() {


    /*if (name === "" || course === "" || email === "") {
        alert("please fill all the fields")
    }*/
    if (!validateForm()) {
        return
    }
    const student = {
        id: Date.now(),
        name: studentName.value.trim(),
        course: studentCourse.value.trim(),
        email: studentEmail.value.trim()
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });
        if (!response.ok) {
            throw new Error(`HTTP Error:: ${response.status}`)
        }
        const newStudent = await response.json()
        students.push(newStudent);
        //saveStudents()
        updateStatistics()
        displayStudents();
        clearForm()
    } catch (error) {
        console.error(error)
        alert("unable to add Student.")
    }

}

function searchStudents() {
    const keyword = searchStudent.value.trim().toLowerCase()
    const filteredStudens = students.filter(student => student.name.toLowerCase().includes(keyword))
    displayStudents(filteredStudens)
}

async function updateStudent(){
    if(!validateForm()){
        return
    }

    const updatedStudent = {
        name: studentName.value.trim(),
        course: studentCourse.value.trim(),
        email: studentEmail.value.trim()
    };

    try{
        const response = await fetch(`${API_URL}/${editingStudentId}`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedStudent)
        })
        if(!response.ok){
            throw new Error(`Error::: ${response.status}`)
        }
        const updated = await response.json()
        const index = students.findIndex(student => student.id === editingStudentId)
        students[index] = updated
        updateStatistics()
        displayStudents()
        clearForm()
    }catch(error){
        console.error(error)
        alert("Unablet to update student")
    }
}

function editStudent(id) {
    const student = students.find(student => student.id === id)
    if(!student){
        return
    }
    editingStudentId = id;
    studentName.value = student.name;
    studentCourse.value = student.course;
    studentEmail.value = student.email;

    addStudentBtn.textContent = "Update Student";
}

async function deleteStudent(id) {
    const isConfirmed = confirm("Are you sure you want to delete this Student?");
    if (!isConfirmed) {
        return
    }
    try{
        const response = await fetch(`${API_URL}/${id}`,{
            method: "DELETE"
        })
        if(!response.ok){
            throw new Error(`Error::: ${response.status}`)
        }
        students = students.filter(student => student.id !== id);
        //saveStudents()
        updateStatistics()
        displayStudents();
    }catch(error){
        console.error(error)
        alert("Unable to delete student")
    }
}

function clearForm() {
    studentName.value = "";
    studentCourse.value = "";
    studentEmail.value = "";

    nameError.textContent = ""
    courseError.textContent = ""
    emailError.textContent = ""

    studentName.classList.remove("input-error")
    studentCourse.classList.remove("input-error")
    studentEmail.classList.remove("input-error")

    editingStudentId = null;
    addStudentBtn = "Add Student"
}

//save students
function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

//load Students
async function loadStudents() {
    /*const data = localStorage.getItem("students")
    if (data) {
        students = JSON.parse(data)
    }*/
    try {
        const response = await fetch(API_URL)
        if (!response.ok) {
            throw new Error(`HTTP Error::: ${response.status}`)
        }
        students = await response.json()
        updateStatistics()
        displayStudents()
    } catch (error) {
        console.error(error)
        studentContainer.innerHTML = "<p>Unable to load Students</p>"
    }

}

//dispaly Students
function displayStudents(studentList = students) {
    if (studentList.length === 0) {
        studentContainer.innerHTML = `
            <p class="empty-message">No Students Yet</p>
        `
        return;
    }
    studentContainer.innerHTML = "";

    studentList.forEach(student => {
        const studentCard = document.createElement("div")
        studentCard.className = "student-card";
        studentCard.innerHTML = `
            <h3>${student.name}</h3>
            <p>Course: ${student.course}</p>
            <p>Email: ${student.email}</p>
            <div class="actions">
                <button onclick="editStudent('${student.id}')">Edit</button>
                <button onclick="deleteStudent('${student.id}')">Delete</button>
            </div>
        `

        studentContainer.appendChild(studentCard);
    })
    /*studentContainer.innerHTML = "";
    students.forEach((student) => {
        const studentElement = document.createElement("div");
        studentElement.innerHTML = `
            <h3>${student.name}</h3>
            <p>Course: ${student.course}</p>
            <p>Email: ${student.email}</p>
            
        `;
        studentContainer.appendChild(studentElement);
    })*/
}

function updateStatistics() {
    totalStudents.textContent = students.length

    const courses = new Set(students.map(student => student.course))
    totalCourses.textContent = courses.size;
}

function sortStudentList() {
    const sortValue = sortStudents.value;
    if (sortValue === "name-asc") {
        students.sort((a, b) => a.name.localeCompare(b.name))
    }

    if (sortValue === "name-desc") {
        students.sort((a, b) => b.name.localeCompare(a.name))
    }

    if (sortValue === "course-asc") {
        students.sort((a, b) => a.course.localeCompare(b.course))
    }

    if (sortValue === "course-desc") {
        students.sort((a, b) => b.course.localeCompare(a.course))
    }

    displayStudents()
}

function validateForm() {
    let isValid = true;

    const name = studentName.value.trim()
    const course = studentCourse.value.trim()
    const email = studentEmail.value.trim()

    //clear previous errors
    nameError.textContent = ""
    courseError.textContent = ""
    emailError.textContent = ""

    studentName.classList.remove("input-error")
    studentCourse.classList.remove("input-error")
    studentEmail.classList.remove("input-error")

    if (name === "") {
        nameError.textContent = "Student name is required."
        studentName.classList.add("input-error")
        isValid = false
    } else if (name.length < 3) {
        nameError.textContent = "Name mus be at least 3 characters."
        studentName.classList.add("input-error")
        isValid = false
    }

    if (course === "") {
        courseError.textContent = "Course is required."
        studentCourse.classList.add("input-error")
        isValid = false
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //dupkicate Email
    const duplicateEmail = students.some(student => student.email.toLowerCase() === email.toLowerCase() && student.id !== editingStudentId)
    if (email === "") {
        emailError.textContent = "Email id is required";
        studentEmail.classList.add("input-error")
        isValid = false
    } else if (duplicateEmail) {
        emailError.textContent = "this email is already registered";
        studentEmail.classList.add("input-error")
        isValid = false
    } else if (!email.includes("@")) {
        emailError.textContent = "please enter valid email"
        studentEmail.classList.add("input-error")
        isValid = false
    } else if (!emailPattern.test(email)) {
        emailError.textContent = "please enter a valid email address";
        studentEmail.classList.add("input-error")
        isValid = false
    }

    return isValid;
}


//load students when page opends
loadStudents()
