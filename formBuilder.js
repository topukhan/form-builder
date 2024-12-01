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

$(document).ready(function () {
    // Add rows to the right section based on checkbox selection
    $('#fieldSelectionForm .form-check-input').on('change', function () {
        const fieldType = $(this).val();
        const fieldId = $(this).attr('id');

        if ($(this).is(':checked')) {
            // Check if already exists in the table to prevent duplicates
            if ($(`#row-${fieldId}`).length > 0) {
                toastr.warning("This field is already added.");
                return;
            }

            // Add row to the right section
            const newRow = `
                <tr id="row-${fieldId}">
                    <td>
                        <select class="form-control field-type">
                            <option value="text" ${fieldType === "text" ? "selected" : ""}>Text</option>
                            <option value="number" ${fieldType === "number" ? "selected" : ""}>Number</option>
                            <option value="email" ${fieldType === "email" ? "selected" : ""}>Email</option>
                            <option value="password" ${fieldType === "password" ? "selected" : ""}>Password</option>
                            <option value="textarea" ${fieldType === "textarea" ? "selected" : ""}>Textarea</option>
                            <option value="checkbox" ${fieldType === "checkbox" ? "selected" : ""}>Checkbox</option>
                            <option value="radio" ${fieldType === "radio" ? "selected" : ""}>Radio</option>
                            <option value="select" ${fieldType === "select" ? "selected" : ""}>Select</option>
                            <option value="date" ${fieldType === "date" ? "selected" : ""}>Date</option>
                            <option value="file" ${fieldType === "file" ? "selected" : ""}>File</option>
                            <option value="button" ${fieldType === "button" ? "selected" : ""}>Button</option>
                        </select>
                    </td>
                    <td><input type="text" class="form-control field-name" placeholder="Field Name"></td>
                    <td><input type="text" class="form-control field-label" placeholder="Field Label"></td>
                    <td><input type="text" class="form-control field-placeholder" placeholder="Placeholder/Options"></td>
                    <td><button type="button" class="btn btn-danger btn-sm remove-field" data-checkbox-id="${fieldId}">Remove</button></td>
                </tr>
            `;
            $('#fieldOptionsTable tbody').append(newRow);
        } else {
            // Remove row from the right section if unchecked
            $(`#row-${fieldId}`).remove();
        }
    });

    // Add Field Button Functionality
    $('#addField').on('click', function () {
        const uniqueId = `custom-${Date.now()}`; // Generate a unique ID for the new field
        const newRow = `
            <tr id="row-${uniqueId}">
                <td>
                    <select class="form-control field-type">
                        <option value="text" selected>Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="password">Password</option>
                        <option value="textarea">Textarea</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                        <option value="select">Select</option>
                        <option value="date">Date</option>
                        <option value="file">File</option>
                        <option value="button">Button</option>
                    </select>
                </td>
                <td><input type="text" class="form-control field-name" placeholder="Field Name"></td>
                <td><input type="text" class="form-control field-label" placeholder="Field Label"></td>
                <td><input type="text" class="form-control field-placeholder" placeholder="Placeholder/Options"></td>
                <td><button type="button" class="btn btn-danger btn-sm remove-field" data-checkbox-id="${uniqueId}">Remove</button></td>
            </tr>
        `;

        $('#fieldOptionsTable tbody').append(newRow);
    });


    // Remove Field Button Functionality
    $('#fieldOptionsTable').on('click', '.remove-field', function () {
        const row = $(this).closest('tr');
        const checkboxId = $(this).data('checkbox-id');

        // Uncheck the corresponding checkbox
        $(`#${checkboxId}`).prop('checked', false);

        // Remove the row
        row.remove();
    });

    // Show Preview Button
    $('#showPreview').on('click', function () {
        let isValid = true;
        let fieldNames = [];

        // Validate each row for mandatory fields
        $('#fieldOptionsTable tbody tr').each(function () {
            const fieldName = $(this).find('.field-name').val();
            const fieldLabel = $(this).find('.field-label').val();
            const fieldType = $(this).find('.field-type').val();
            const placeholder = $(this).find('.field-placeholder').val();

            // Check for mandatory fields
            if (!fieldName || !fieldLabel) {
                isValid = false;
                toastr.error("Field Name and Label are required.");
                return false;
            }

            // Check for unique field name
            if (fieldNames.includes(fieldName)) {
                isValid = false;
                toastr.error(`Field Name "${fieldName}" must be unique.`);
                return false;
            } else {
                fieldNames.push(fieldName); // Add field name to the list
            }

            // Placeholder validation for checkbox, radio, and select
            if (
                (fieldType === 'checkbox' || fieldType === 'radio' || fieldType === 'select') &&
                !placeholder
            ) {
                isValid = false;
                toastr.error(
                    `Field of type "${fieldType}" requires options in the Placeholder/Options field.`
                );
                return false;
            }
        });

        // If validation passes, show the preview
        if (isValid) {
            const previewContent = $('#fieldOptionsTable tbody tr')
                .map(function () {
                    const fieldType = $(this).find('.field-type').val();
                    const fieldName = $(this).find('.field-name').val();
                    const fieldLabel = $(this).find('.field-label').val();
                    const placeholder = $(this).find('.field-placeholder').val();

                    if (fieldType === 'button') {
                        return `<button class="btn btn-primary mt-4" type="button">${fieldLabel}</button>`;
                    } else if (fieldType === 'checkbox' || fieldType === 'radio') {
                        const options = placeholder
                            .split(',')
                            .map(
                                (opt, index) =>
                                    `<div class="form-check"><input class="form-check-input" type="${fieldType}" id="${fieldName}-${index}" name="${fieldName}" ><label class="form-check-label" for="${fieldName}-${index}"> ${opt.trim()}</label></div>`
                            )
                            .join('');
                        return `<div><label>${fieldLabel}</label>${options}</div>`;
                    } else if (fieldType === 'select') {
                        const options = placeholder
                            .split(',')
                            .map((opt) => `<option>${opt.trim()}</option>`)
                            .join('');
                        return `<div><label>${fieldLabel}</label><select class="form-select">${options}</select></div>`;
                    } else {
                        return `<div><label class="form-label" for="${fieldName}">${fieldLabel}</label><input type="${fieldType}" id="${fieldName}" name="${fieldName}" placeholder="${placeholder}" class="form-control"></div>`;
                    }
                })
                .get()
                .join('');

            // Inject the preview content into the modal
            $('#previewModal .modal-body').html(previewContent);

            // Inject the generated HTML into the modal
            $('#generated_html').text(previewContent.trim());

            // Show preview modal
            $('#previewModal').modal('show');
        }
    });

    // Copy HTML code to clipboard
    $(document).on('click', '#copyHtml', function () {
        const htmlCode = $('#generated_html').text();

        navigator.clipboard.writeText(htmlCode).then(() => {
            toastr.success("HTML code copied to clipboard!");
            // Change the button text temporarily
            const copyButton = $(this);
            copyButton.text("Copied");
            setTimeout(() => copyButton.text("Copy HTML"), 3000);
        }).catch((error) => {
            toastr.error("Failed to copy HTML: " + error);
        });
    });
});
