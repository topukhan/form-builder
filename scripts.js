toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "4000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
};

tippy("#field_name_info", {
    content: `e.g.,<input name="username" />`,
    theme: 'light',
});

tippy("#field_label_info", {
    content: `e.g.,<label for="field_label" >Full Name</label>`,
    theme: 'light',
});

let fields = [];

// Initialize field type options toggle
$("#field_type").on("change", function () {
    const type = $(this).val();
    $("#options_container").toggleClass(
        "d-none",
        !["checkbox", "radio", "select"].includes(type)
    );
});

// Add a new field
$("#add_field").on("click", function () {
    const fieldType = $("#field_type").val();
    const fieldName = $("#field_name").val().trim();
    const fieldLabel = $("#field_label").val().trim();
    const fieldOptions = $("#field_options").val().trim();

    if (!validateField(fieldType, fieldName, fieldLabel, fieldOptions)) return;

    const field = {
        type: fieldType,
        name: fieldName,
        label: fieldLabel,
        options: ["checkbox", "radio", "select"].includes(fieldType)
            ? fieldOptions.split(",").map((option) => option.trim())
            : [],
    };

    fields.push(field);
    resetInputs();
    updateUI();
});

// Validate field input
function validateField(type, name, label, options) {
    if (!name || !label) {
        toastr.error("Field Name and Label are required.");
        return false;
    }
    if (fields.some((field) => field.name === name)) {
        toastr.error("Field Name must be unique.");

        return false;
    }
    if (["checkbox", "radio", "select"].includes(type) && !options) {
        toastr.error(
            "Options are required for checkbox, radio, and select fields."
        );

        return false;
    }
    if (type === "button" && fields.some((field) => field.type === "button")) {
        toastr.error("Only one submit button is allowed.");
        return false;
    }
    return true;
}

// Reset input fields
function resetInputs() {
    $("#field_name, #field_label, #field_options, #options_container").val("");
}

// Update UI: Preview, field list, and generated HTML
function updateUI() {
    updatePreview();
    updateFieldList();
}

// Update the preview form
function updatePreview() {
    const previewForm = $("#preview_form");
    const generatedHtml = $("#generated_html");

    const renderedFields = fields.map(renderField).join("");
    previewForm.html(renderedFields);
    generatedHtml.text(renderedFields.trim());
}

// Render HTML for individual fields
function renderField(field) {
    switch (field.type) {
        case "checkbox":
        case "radio":
            return renderMultipleChoiceField(field);
        case "select":
            return renderSelectField(field);
        case "button":
            return `
        <div class="mb-3">
            <button type="submit" name="${field.name}" class="btn btn-success">${field.label}</button>
        </div>`;
        case "text":
        case "number":
        case "email":
        case "password":
        case "file":
        case "date":
        default:
            return `
        <div class="mb-3">
            <label class="form-label">${field.label}</label>
            <input type="${field.type}" name="${field.name}" class="form-control" placeholder="${field.label}">
        </div>`;
        case "textarea":
            return `
        <div class="mb-3">
            <label class="form-label">${field.label}</label>
            <textarea name="${field.name}" class="form-control"></textarea>
        </div>`;
    }
}

// Render checkbox and radio fields
let fieldCounter = 0;

function renderMultipleChoiceField(field) {
    const fieldIndex = fieldCounter++;

    // Generate HTML for options
    const options = field.options
        .map((option, optionIndex) => {
            // Combine field name, option text, and index for uniqueness
            const optionId = `${field.name}_${option
                .replace(/\s+/g, "_")
                .toLowerCase()}_${fieldIndex}_${optionIndex}`;
            return `
        <div class="form-check form-check-inline">
            <input type="${field.type}" id="${optionId}" name="${field.name}" value="${option}" class="form-check-input">
            <label class="form-check-label" for="${optionId}">${option}</label>
        </div>`;
        })
        .join(""); // Combine all options into a single string

    // Wrap options in a container with a label
    return `
        <div class="mb-3">
            <label class="form-label">${field.label}</label><br>
            ${options}
        </div>`;
}

// Render select fields
function renderSelectField(field) {
    const options = field.options
        .map((option) => `<option value="${option}">${option}</option>`)
        .join("");

    return `
        <div class="mb-3">
            <label class="form-label">${field.label}</label>
            <select name="${field.name}" class="form-select">${options}</select>
        </div>`;
}

// Update the field list
function updateFieldList() {
    const fieldList = $("#field_list");
    fieldList.empty();

    fields.forEach((field, index) => {
        fieldList.append(`
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${field.label} (${field.type})</span>
            <button class="btn btn-danger btn-sm remove-field" data-index="${index}">Remove</button>
        </div>`);
    });

    $(".remove-field")
        .off("click")
        .on("click", function () {
            const index = $(this).data("index");
            fields.splice(index, 1);
            updateUI();
            toastr.success("Field removed successfully.");
        });
}

// Copy generated HTML
$("#copy_html").on("click", function () {
    const htmlContent = $("#generated_html").text();
    navigator.clipboard.writeText(htmlContent).then(() => {
        const copyButton = $(this);
        copyButton.text("Copied");
        setTimeout(() => copyButton.text("Copy HTML"), 3000);
    });
});
