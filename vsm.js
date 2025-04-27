	/**
	 * @Author - Mohit Katiyar
	 * @CreatedDate - 14th April 2025
	 * @description This Javascript contains functions to allow generation of a VSM 
	 * Allows creation of Workcentres, Tasks, Cycletime, Value Added time, Manual/Automated/PArtially Automated tasks.
	 */

	//Display The customer Requirement input when the page loads
	document.addEventListener("DOMContentLoaded", function() {
		addCustomerRequirement(); // Call the function when the DOM is fully loaded
		validateForm();

	});

	let isProgressUnsaved = true; // Set this true when changes are made
	let pendingEvent = null;
	let workcentres = [];
	let hasWorkcentreAdded = false; // Flag to track if Workcentre has been added at the beginning


	//function add dragHandle
	function addDragHandle(e){
		//drag handle
		const dragHandle = document.createElement('div');
		dragHandle.classList.add('drag-handle');
		
		// Make just the handle draggable (optional, depending on how your drag works)
		dragHandle.setAttribute('draggable', true);
		
		// Inner dot grid
		const dotGrid = document.createElement('div');
		dotGrid.classList.add('dot-grid');
		
		// Create 9 dots
		for (let i = 0; i < 9; i++) {
			const dot = document.createElement('span');
			dotGrid.appendChild(dot);
		}
		
		dragHandle.appendChild(dotGrid);
		e.appendChild(dragHandle); // Add handle to the container	
		
		//end of drag handle		
	}
	
	function addVDragHandle(e){
		
		const verticalHandle = document.createElement('div');
		verticalHandle.classList.add('vertical-dots-handle');

		for (let i = 0; i < 3; i++) {
			const dot = document.createElement('span');
			verticalHandle.appendChild(dot);
		}

		e.appendChild(verticalHandle); // Add it to the row
	}
	
	//logic to clear canvas when the user deletes workcentres
	function clearCanvas() {

		if (workcentres.length === 0) {
			const svg = d3.select("#vsmChart");
			svg.selectAll("*").remove();
			//hide the No Chart Message
			document.getElementById("noChartMessage").style.display = "block";
		}
	}

	//Toggle modal visibility
	function toggleHowToModal() {
		const modal = document.getElementById('howToModal');
		modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
	}

	// Close modal if clicked outside
	window.onclick = function(event) {
		const modal = document.getElementById('howToModal');
		if (event.target === modal) {
			modal.style.display = 'none';
		}
	}

	// Close modal on pressing Escape key
	document.addEventListener('keydown', function(event) {
		const modal = document.getElementById('howToModal');
		if (event.key === 'Escape' && modal.style.display === 'block') {
			modal.style.display = 'none';
		}
	});


	function validateForm() {
		let isValid = true;

		// Validate Customer Requirements
		const customerRequirementInput = document.getElementById("customerRequirementInput");
		if (!customerRequirementInput.value.trim()) {
			customerRequirementInput.style.border = "2px dotted red";
			isValid = false;
		} else {
			customerRequirementInput.style.border = "1px dotted green";
		}

		// Validate Workcentres
		workcentres.forEach(wc => {
			// Workcentre name
			if (!wc.workcentreName.value.trim()) {
				wc.workcentreName.style.border = "2px dotted red";
				isValid = false;
			} else {
				wc.workcentreName.style.border = "1px dotted green";
			}

			wc.tasks.forEach(task => {
				// Task Name
				if (!task.taskName.value.trim()) {
					task.taskName.style.border = "2px dotted red";
					isValid = false;
				} else {
					task.taskName.style.border = "1px dotted green";
				}

				// Cycle Time
				if (!task.cycleTime.value.trim()) {
					task.cycleTime.style.border = "2px dotted red";
					isValid = false;
				} else {
					task.cycleTime.style.border = "1px dotted green";
				}

				// Value Added Time
				if (!task.valueAddedTime.value.trim()) {
					task.valueAddedTime.style.border = "2px dotted red";
					isValid = false;
				} else {
					task.valueAddedTime.style.border = "1px dotted green";
				}


				// Ownership
				if (!task.ownershipField.value.trim()) {
					task.ownershipField.style.border = "2px dotted red";
					isValid = false;
				} else {
					task.ownershipField.style.border = "1px dotted green";
				}
			});
		});

		return isValid;
	}


	function addCustomerRequirement() {
		const customerRequirementContainer = document.getElementById('customerRequirement');

		// Create a div for the customer requirement input
		const customerRequirementDiv = document.createElement('div');
		customerRequirementDiv.classList.add('input-container');

		// Create the label for Customer Requirement
		const customerRequirementLabel = document.createElement('label');
		customerRequirementLabel.textContent = "Customer Requirement"; // Label text
		customerRequirementLabel.setAttribute('for', 'customerRequirementInput'); // Set 'for' attribute to link label with the input
		customerRequirementDiv.appendChild(customerRequirementLabel);

		// Create a text field for Customer Requirement input
		const customerRequirementInput = document.createElement('input');
		customerRequirementInput.id = 'customerRequirementInput';  // Set the id to 'customerRequirementInput'
		customerRequirementInput.placeholder = 'Enter Customer Requirement';
		customerRequirementDiv.appendChild(customerRequirementInput);

		// Append the customer requirement div to the container
		customerRequirementContainer.appendChild(customerRequirementDiv);
		customerRequirementInput.focus();

		// Add event listener to the input field to call addWorkcentre once there is input
		customerRequirementInput.addEventListener('input', function() {
			const inputValue = customerRequirementInput.value.trim();
			validateForm();
			// Check if there are any workcentres displayed
			const workcentreContainer = document.getElementById('workcentres');
			const hasWorkcentreDisplayed = workcentreContainer && workcentreContainer.children.length > 0;

			// Only call addWorkcentre if the input is not empty and no workcentres are displayed
			if (inputValue !== '' && !hasWorkcentreDisplayed) {
				addWorkcentre();  // Call addWorkcentre once			
			}
		});
	}

	//Function to add a workcentre form dynamically
	function addWorkcentre() {
		const workcentreContainer = document.getElementById('workcentres');

		const workcentreDiv = document.createElement('div');

		//draggable
		enableWorkcentreDragAndDrop(workcentreDiv);
		//end of draggable WC
		workcentreDiv.classList.add('input-container');

		const workcentreName = document.createElement('input');
		workcentreName.placeholder = 'Workcentre Name';
		workcentreName.classList.add('input');
		workcentreDiv.appendChild(workcentreName);

		
		workcentreName.addEventListener('input', function() {
			updateWorkcentreTotals(workcentres.find(wc => wc.workcentreName === workcentreName));
		});

		
		// Readonly fields for Cycle Time and VAT
		const cycleTimeField = document.createElement('input');
		cycleTimeField.placeholder = 'Total Cycle Time (Computed)';
		//cycleTimeField.classList.add('readonly-input');
		cycleTimeField.readOnly = true;
		workcentreDiv.appendChild(cycleTimeField);

		const vatField = document.createElement('input');
		vatField.placeholder = 'Total VAT(Computed)';
		//vatField.classList.add('readonly-input');
		vatField.readOnly = true;
		workcentreDiv.appendChild(vatField);

		const commentsField = document.createElement('input');
		commentsField.placeholder = 'Comments';
		commentsField.classList.add('comments');
		workcentreDiv.appendChild(commentsField);

		commentsField.addEventListener('input', function() {
			updateWorkcentreTotals(workcentres.find(wc => wc.workcentreName === workcentreName));
		});

		
		const taskContainer = document.createElement('div');
		taskContainer.classList.add('task-container');
		const addTaskButton = document.createElement('button');
		addTaskButton.textContent = 'Add Task';
		addTaskButton.onclick = function() {
			addTask(workcentreDiv, taskContainer);
		};
		workcentreDiv.appendChild(addTaskButton);

		const deleteWCButton = document.createElement('button');
		deleteWCButton.classList.add('delete-wc-button');
		deleteWCButton.textContent = 'Delete Workcentre';
		deleteWCButton.onclick = function() {
			deleteWorkcentre(workcentreDiv);
		};
		workcentreDiv.appendChild(deleteWCButton);

		workcentreDiv.appendChild(taskContainer);

		workcentres.push({
			workcentreName,
			cycleTimeField,
			vatField,
			commentsField,
			workcentreDiv,
			tasks: []
		});

		workcentreContainer.appendChild(workcentreDiv);

		if (workcentres.length > 1) {
			workcentreName.focus();
		}

		validateForm();
		
	}

	//Function to delete a workcentre
	function deleteWorkcentre(workcentreDiv) {
		const index = workcentres.findIndex(wc => wc.workcentreName.value === workcentreDiv.querySelector('input').value);
		if (index !== -1) {
			// Remove the workcentre from the workcentres array
			workcentres.splice(index, 1);
		}
		// Remove the workcentre div from the DOM
		workcentreDiv.remove();

		// Update the JSON after workcentre removal
		updateJSON();  // Update the JSON after workcentre removal	

		if (workcentres.length === 0) {
			clearCanvas();
		}
		else {
			generateVSM();
		}


	}


	//Function to get Automatin status
	function getAutomationValue(automatedCheckbox, partiallyAutomatedCheckbox) {
		if (automatedCheckbox.checked) {
			return "A";
		} else if (partiallyAutomatedCheckbox.checked) {
			return "P/A";
		}
		return "M";
	}

	//enable WC dnd
	function enableWorkcentreDragAndDrop(workcentreDiv) {
		workcentreDiv.setAttribute('draggable', true);

		workcentreDiv.addEventListener('dragstart', (e) => {
			e.dataTransfer.setData('text/plain', workcentreDiv.dataset.index);
			workcentreDiv.classList.add('dragging');
		});

		workcentreDiv.addEventListener('dragend', () => {
			workcentreDiv.classList.remove('dragging');
		});

		workcentreDiv.addEventListener('dragover', (e) => {
			e.preventDefault();
			const draggingEl = document.querySelector('.dragging');
			const container = document.getElementById('workcentres');
			const afterElement = getDragAfterElement(container, e.clientY);
			if (afterElement == null) {
				container.appendChild(draggingEl);
			} else {
				container.insertBefore(draggingEl, afterElement);
			}
			updateWorkcentreOrder();
		});
	}

	//enable task dnd
	function enableTaskDragAndDrop(taskDiv, taskContainer, workcentreObj) {
		taskDiv.setAttribute('draggable', true);

		taskDiv.addEventListener('dragstart', () => {
			taskDiv.classList.add('dragging');
		});

		taskDiv.addEventListener('dragend', () => {
			taskDiv.classList.remove('dragging');
		});

		taskContainer.addEventListener('dragover', (e) => {
			e.preventDefault();
			const draggingEl = taskContainer.querySelector('.dragging');
			const afterElement = getDragAfterElement(taskContainer, e.clientY);
			if (!draggingEl) return;

			if (afterElement == null) {
				taskContainer.appendChild(draggingEl);
			} else {
				taskContainer.insertBefore(draggingEl, afterElement);
			}

			updateTaskOrder(workcentreObj);
		});
	}


	//Function to add a task under a workcentre
	function addTask(workcentreDiv, taskContainer) {
		const taskDiv = document.createElement('div');

		//dnd tasks
		enableTaskDragAndDrop(taskDiv, taskContainer, workcentreDiv);
		//dnd tasks

		taskDiv.classList.add('task');

		const taskName = document.createElement('input');
		taskName.placeholder = 'Task Name';
		taskName.classList.add('taskInput');
		taskDiv.appendChild(taskName);

		const cycleTime = document.createElement('input');
		cycleTime.type = 'number';
		cycleTime.placeholder = 'Cycle Time';
		cycleTime.classList.add('taskInput');
		taskDiv.appendChild(cycleTime);

		const valueAddedTime = document.createElement('input');
		valueAddedTime.type = 'number';
		valueAddedTime.placeholder = 'Value Added Time';
		valueAddedTime.classList.add('taskInput');
		taskDiv.appendChild(valueAddedTime);

		const ownershipField = document.createElement('input');
		ownershipField.placeholder = 'Owning Team';
		ownershipField.classList.add('taskInput');
		taskDiv.appendChild(ownershipField);

		// Automated checkbox
		const isAutomated = document.createElement('input');
		isAutomated.type = 'checkbox';
		isAutomated.id = 'automatedCheckbox';

		const automatedLabel = document.createElement('label');
		automatedLabel.setAttribute('for', 'automatedCheckbox');
		automatedLabel.appendChild(document.createTextNode(' Automated'));

		// Partially Automated checkbox
		const isPartiallyAutomated = document.createElement('input');
		isPartiallyAutomated.type = 'checkbox';
		isPartiallyAutomated.id = 'partiallyAutomatedCheckbox';

		const partiallyAutomatedLabel = document.createElement('label');
		partiallyAutomatedLabel.setAttribute('for', 'partiallyAutomatedCheckbox');
		partiallyAutomatedLabel.appendChild(document.createTextNode(' Partially Automated'));

		// Mutual exclusivity logic
		isAutomated.addEventListener('change', function() {
			if (isAutomated.checked) {
				isPartiallyAutomated.checked = false;
			}
			updateWorkcentreTotals(workcentre);
		});

		isPartiallyAutomated.addEventListener('change', function() {
			if (isPartiallyAutomated.checked) {
				isAutomated.checked = false;
			}
			updateWorkcentreTotals(workcentre);
		});

		// Append checkboxes
		taskDiv.appendChild(isAutomated);
		taskDiv.appendChild(automatedLabel);
		taskDiv.appendChild(isPartiallyAutomated);
		taskDiv.appendChild(partiallyAutomatedLabel);

		//add comments
		const taskComments = document.createElement('input');
		taskComments.placeholder = 'Task Comments';
		taskComments.classList.add('comments');
		taskDiv.appendChild(taskComments);


		// Delete button
		const deleteTaskButton = document.createElement('button');
		deleteTaskButton.textContent = 'Delete';
		deleteTaskButton.onclick = function() {
			deleteTask(taskDiv, workcentreDiv);
		};
		taskDiv.appendChild(deleteTaskButton);

		taskContainer.appendChild(taskDiv);

		const workcentre = workcentres.find(wc => wc.workcentreName.value === workcentreDiv.querySelector('input').value);

		workcentre.tasks.push({
			taskName,
			cycleTime,
			valueAddedTime,
			ownershipField,
			getAutomation: () => getAutomationValue(isAutomated, isPartiallyAutomated),
			taskComments
		});

		taskName.focus();

		// Input event listeners
		taskName.addEventListener('input', () => updateWorkcentreTotals(workcentre));
		cycleTime.addEventListener('input', () => updateWorkcentreTotals(workcentre));
		valueAddedTime.addEventListener('input', () => updateWorkcentreTotals(workcentre));
		ownershipField.addEventListener('input', () => updateWorkcentreTotals(workcentre));
		isAutomated.addEventListener('change', () => updateWorkcentreTotals(workcentre));
		isPartiallyAutomated.addEventListener('change', () => updateWorkcentreTotals(workcentre));
		taskComments.addEventListener('input', () => updateWorkcentreTotals(workcentre));
		
		updateWorkcentreTotals(workcentre);
	}

	//Function to delete a task
	function deleteTask(taskDiv, workcentreDiv) {
		const workcentre = workcentres.find(wc => wc.workcentreName.value === workcentreDiv.querySelector('input').value);

		// Ensure the task is properly identified
		const taskName = taskDiv.querySelector('input').value;
		const taskIndex = workcentre.tasks.findIndex(task => task.taskName.value === taskName);

		if (taskIndex !== -1) {
			// Remove task data from the workcentre
			workcentre.tasks.splice(taskIndex, 1);
		}

		// Remove the task element from the DOM
		taskDiv.remove();

		// Update workcentre totals and JSON
		updateWorkcentreTotals(workcentre);
		updateJSON();
		generateVSM();
	}

	//Function to update the totals for a workcentre
	function updateWorkcentreTotals(workcentre) {
		let totalCycleTime = 0;
		let totalVAT = 0;

		workcentre.tasks.forEach(task => {
			totalCycleTime += parseFloat(task.cycleTime.value || 0);
			totalVAT += parseFloat(task.valueAddedTime.value || 0);
		});

		workcentre.cycleTimeField.value = totalCycleTime ? totalCycleTime : '';
		workcentre.vatField.value = totalVAT ? totalVAT : '';

		updateJSON();
		generateVSM();
	}

	function updateJSON() {
		if (!validateForm()) {
			//alert("Please fill in all required fields.");
			return;
		}

		// Get the customer requirements input value
		const customerRequirementInput = document.getElementById("customerRequirementInput");
		const customerRequirements = customerRequirementInput && customerRequirementInput.value.trim()
			? customerRequirementInput.value.trim()
			: "Customer Requirements";

		// Build workcentres array
		const workcentresArray = workcentres.map(wc => {
			const totalCycleTime = wc.tasks.reduce((sum, task) => sum + parseFloat(task.cycleTime.value || 0), 0);
			const totalVAT = wc.tasks.reduce((sum, task) => sum + parseFloat(task.valueAddedTime.value || 0), 0);
			const wcName = wc.workcentreName.value || 'Unnamed Workcentre';
			const wcComments = wc.commentsField.value;

			return {
				workcentre: wcName,
				totalCycleTime,
				totalVAT,
				wcComments,
				tasks: wc.tasks.map(task => ({
					taskName: task.taskName.value,
					cycleTime: task.cycleTime.value,
					valueAddedTime: task.valueAddedTime.value,
					ownership: task.ownershipField.value,
					automation: task.getAutomation(),
					comments: task.taskComments.value
				}))
			};
		});

		const chartData = {
			customerRequirements: customerRequirements,
			workcentres: workcentresArray
		};

		document.getElementById('jsonOutput').value = JSON.stringify(chartData, null, 2);
		//generateVSM();
	}


	function exportD3ChartAsPNG(svgSelector = '#vsmChart', filename = 'chart-export.png') {
		const svgElement = document.querySelector(svgSelector);

		if (!svgElement) {
			alert('SVG element not found!');
			return;
		}

		const serializer = new XMLSerializer();
		let source = serializer.serializeToString(svgElement);

		// Add namespaces
		if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
			source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
		}
		if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
			source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
		}

		const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(svgBlob);
		const img = new Image();

		const bbox = svgElement.getBBox();
		const width = bbox.width + bbox.x;
		const height = bbox.height + bbox.y;

		img.onload = function() {
			// Create a canvas with extra space for the border, padding, and margins
			const padding = 20;  // Padding between the chart and the border (adjust as needed)
			const borderRadius = 8;  // Border radius for rounded corners
			const margin = 10;  // Margin around the image to separate from the border

			// New canvas size considering margin, padding, and rounded corners
			const canvas = document.createElement('canvas');
			canvas.width = width + padding * 2 + margin * 2;  // Add padding and margin on both sides
			canvas.height = height + padding * 2 + margin * 2;  // Add padding and margin on top and bottom
			const ctx = canvas.getContext('2d');

			// Set the background color to white
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);  // Fill the entire canvas with white

			// Draw the image on the canvas (add the padding area before drawing)
			ctx.drawImage(img, padding + margin, padding + margin);

			// Optionally, add a rounded border to resemble the .elementsContainer style
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#ddd';
			ctx.beginPath();
			ctx.moveTo(padding + margin + borderRadius, padding + margin); // Start at top left rounded corner
			ctx.arcTo(canvas.width - padding - margin, padding + margin, canvas.width - padding - margin, canvas.height - padding - margin, borderRadius); // top-right
			ctx.arcTo(canvas.width - padding - margin, canvas.height - padding - margin, padding + margin, canvas.height - padding - margin, borderRadius); // bottom-right
			ctx.arcTo(padding + margin, canvas.height - padding - margin, padding + margin, padding + margin, borderRadius); // bottom-left
			ctx.arcTo(padding + margin, padding + margin, canvas.width - padding - margin, padding + margin, borderRadius); // top-left
			ctx.closePath();
			ctx.stroke(); // Apply the rounded border

			// Create the download link and trigger the download
			const link = document.createElement('a');
			link.download = filename;
			link.href = canvas.toDataURL('image/png');
			link.click();
		};

		img.onerror = function() {
			alert("Could not load image from SVG.");
		};

		img.src = url;
	}


	//Export JSON
	function exportJSON(filename = 'vsm-data.json') {
		const jsonData = document.getElementById('jsonOutput').value;
		const blob = new Blob([jsonData], { type: 'application/json' });
		const link = document.createElement('a');
		link.download = filename;
		link.href = URL.createObjectURL(blob);
		link.click();
	}

	//Import JSON
	function importJSON(event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = function(e) {
			const json = JSON.parse(e.target.result);
			loadFromJSON(json);
		};
		reader.readAsText(file);
	}

	function loadFromJSON(dataArray) {
		// Clear current state
		workcentres = [];
		document.getElementById('workcentres').innerHTML = '';
		document.getElementById('jsonOutput').value = '';

		// Set customer requirements from first object
		const customerRequirementInput = document.getElementById('customerRequirementInput');
		const firstEntry = dataArray[0];
		customerRequirementInput.value = firstEntry.customerRequirements || "Customer Requirements";

		// Loop through remaining workcentres
		for (let i = 1; i < dataArray.length; i++) {
			const wc = dataArray[i];
			const workcentreDiv = document.createElement('div');
			
			//drag handle
			addDragHandle(workcentreDiv);		
			//end of drag handle		
			
			//draggable
			enableWorkcentreDragAndDrop(workcentreDiv);
			
			//end of draggable WC
			workcentreDiv.classList.add('input-container');

			const workcentreName = document.createElement('input');
			workcentreName.placeholder = 'Workcentre Name';
			workcentreName.value = wc.workcentre;
			workcentreDiv.appendChild(workcentreName);

			const cycleTimeField = document.createElement('input');
			cycleTimeField.placeholder = 'Total Cycle Time';
			//cycleTimeField.classList.add('readonly-input');
			cycleTimeField.readOnly = true;
			cycleTimeField.value = wc.totalCycleTime || 0;
			workcentreDiv.appendChild(cycleTimeField);

			const vatField = document.createElement('input');
			vatField.placeholder = 'Total VAT';
			//vatField.classList.add('readonly-input');
			vatField.readOnly = true;
			vatField.value = wc.totalVAT || 0;
			workcentreDiv.appendChild(vatField);

			const commentsField = document.createElement('input');
			commentsField.placeholder = 'Comments';
			commentsField.classList.add('comments');
			workcentreDiv.appendChild(commentsField);


			const taskContainer = document.createElement('div');
			taskContainer.classList.add('task-container');

			const addTaskButton = document.createElement('button');
			addTaskButton.textContent = 'Add Task';
			addTaskButton.onclick = () => addTask(workcentreDiv, taskContainer);
			workcentreDiv.appendChild(addTaskButton);

			const deleteWCButton = document.createElement('button');
			deleteWCButton.classList.add('delete-wc-button');
			deleteWCButton.textContent = 'Delete Workcentre';
			deleteWCButton.onclick = () => deleteWorkcentre(workcentreDiv);
			workcentreDiv.appendChild(deleteWCButton);

			workcentreDiv.appendChild(taskContainer);

			const workcentreObj = {
				workcentreName,
				cycleTimeField,
				vatField,
				commentsField,
				workcentreDiv,
				tasks: []
			};

			(wc.tasks || []).forEach(taskData => {
				const taskDiv = document.createElement('div');
				
				//drag handle
				addVDragHandle(taskDiv);		
				//end of drag handle
			
				//dnd tasks
				enableTaskDragAndDrop(taskDiv, taskContainer, workcentreDiv);
				//dnd tasks
				taskDiv.classList.add('task');

				const taskName = document.createElement('input');
				taskName.placeholder = 'Task Name';
				taskName.value = taskData.taskName;
				taskDiv.appendChild(taskName);

				const cycleTime = document.createElement('input');
				cycleTime.type = 'number';
				cycleTime.placeholder = 'Cycle Time';
				cycleTime.value = taskData.cycleTime;
				taskDiv.appendChild(cycleTime);

				const valueAddedTime = document.createElement('input');
				valueAddedTime.type = 'number';
				valueAddedTime.placeholder = 'Value Added Time';
				valueAddedTime.value = taskData.valueAddedTime;
				taskDiv.appendChild(valueAddedTime);

				const ownershipField = document.createElement('input');
				ownershipField.placeholder = 'Owning Team';
				ownershipField.value = taskData.ownership || '';
				taskDiv.appendChild(ownershipField);

				// Create Automation Checkboxes
				const isAutomated = document.createElement('input');
				isAutomated.type = 'checkbox';
				isAutomated.id = `auto-${Math.random()}`;

				const autoLabel = document.createElement('label');
				autoLabel.setAttribute('for', isAutomated.id);
				autoLabel.textContent = ' Automated';

				const isPartiallyAutomated = document.createElement('input');
				isPartiallyAutomated.type = 'checkbox';
				isPartiallyAutomated.id = `partial-auto-${Math.random()}`;

				const partialLabel = document.createElement('label');
				partialLabel.setAttribute('for', isPartiallyAutomated.id);
				partialLabel.textContent = ' Partially Automated';

				// Set checkbox state based on taskData.automation
				const automationType = taskData.automation;
				if (automationType === "A") {
					isAutomated.checked = true;
				} else if (automationType === "P/A") {
					isPartiallyAutomated.checked = true;
				}
				// "M" means neither is checked

				// Mutual exclusivity
				isAutomated.addEventListener('change', () => {
					if (isAutomated.checked) {
						isPartiallyAutomated.checked = false;
					}
					updateWorkcentreTotals(workcentreObj);
				});
				isPartiallyAutomated.addEventListener('change', () => {
					if (isPartiallyAutomated.checked) {
						isAutomated.checked = false;
					}
					updateWorkcentreTotals(workcentreObj);
				});

				taskDiv.appendChild(isAutomated);
				taskDiv.appendChild(autoLabel);
				taskDiv.appendChild(isPartiallyAutomated);
				taskDiv.appendChild(partialLabel);

				//add comments
				const taskComments = document.createElement('input');
				taskComments.placeholder = 'Task Comments';
				taskComments.classList.add('comments');
				taskComments.value = taskData.comments || "";
				taskDiv.appendChild(taskComments);


				// Delete Task Button
				const deleteTaskButton = document.createElement('button');
				deleteTaskButton.textContent = 'Delete Task';
				deleteTaskButton.onclick = () => deleteTask(taskDiv, workcentreDiv);
				taskDiv.appendChild(deleteTaskButton);

				taskContainer.appendChild(taskDiv);

				// Add task object with automation getter
				workcentreObj.tasks.push({
					taskName,
					cycleTime,
					valueAddedTime,
					ownershipField,
					getAutomation: () => getAutomationValue(isAutomated, isPartiallyAutomated),
					taskComments
				});

				// Add listeners
				cycleTime.addEventListener('input', () => updateWorkcentreTotals(workcentreObj));
				valueAddedTime.addEventListener('input', () => updateWorkcentreTotals(workcentreObj));
				ownershipField.addEventListener('input', () => updateWorkcentreTotals(workcentreObj));
				isAutomated.addEventListener('change', () => updateWorkcentreTotals(workcentreObj));
				isPartiallyAutomated.addEventListener('change', () => updateWorkcentreTotals(workcentreObj));
			});

			workcentres.push(workcentreObj);
			document.getElementById('workcentres').appendChild(workcentreDiv);
		}

		updateJSON();
		generateVSM();

		// Scroll to chart
		document.getElementById("vsmChart").scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
	}


	function loadSampleVSM() {
		const sampleJSON = [
			{
				"customerRequirements": "I want to request something"
			},
			{
				"workcentre": "Process 1",
				"totalCycleTime": 20,
				"totalVAT": 8,
				"tasks": [
					{
						"taskName": "Process1 - Task 1",
						"cycleTime": "10",
						"valueAddedTime": "2",
						"ownership": "Team A",
						"automation": "P/A"
					},
					{
						"taskName": "Process1 - Task 2",
						"cycleTime": "5",
						"valueAddedTime": "5",
						"ownership": "Team B",
						"automation": "A"
					},
					{
						"taskName": "Process1 - Task 3",
						"cycleTime": "5",
						"valueAddedTime": "1",
						"ownership": "Team A",
						"automation": "M"
					}
				]
			},
			{
				"workcentre": "Process 2",
				"totalCycleTime": 11,
				"totalVAT": 3,
				"tasks": [
					{
						"taskName": "Process2 - Task 1",
						"cycleTime": "10",
						"valueAddedTime": "2",
						"ownership": "Team C",
						"automation": "M"
					},
					{
						"taskName": "Process2 - Task 2",
						"cycleTime": "1",
						"valueAddedTime": "1",
						"ownership": "Team C",
						"automation": "A"
					}
				]
			},
			{
				"workcentre": "Process 3",
				"totalCycleTime": 39,
				"totalVAT": 18,
				"tasks": [
					{
						"taskName": "Process3 - Task 1",
						"cycleTime": "14",
						"valueAddedTime": "4",
						"ownership": "Team A",
						"automation": "M"
					},
					{
						"taskName": "Process3 - Task 2",
						"cycleTime": "12",
						"valueAddedTime": "12",
						"ownership": "Team B",
						"automation": "A"
					},
					{
						"taskName": "Process3 - Task 3",
						"cycleTime": "13",
						"valueAddedTime": "2",
						"ownership": "Team C",
						"automation": "M"
					}
				]
			},
			{
				"workcentre": "Process 4",
				"totalCycleTime": 10,
				"totalVAT": 10,
				"tasks": [
					{
						"taskName": "Process4 - Task 1",
						"cycleTime": "4",
						"valueAddedTime": "4",
						"ownership": "Team C",
						"automation": "A"
					},
					{
						"taskName": "Process4 - Task 2",
						"cycleTime": "3",
						"valueAddedTime": "3",
						"ownership": "Team C",
						"automation": "A"
					},
					{
						"taskName": "Process4 - Task 3",
						"cycleTime": "3",
						"valueAddedTime": "3",
						"ownership": "Team C",
						"automation": "A"
					}
				]
			},
			{
				"workcentre": "Process 5",
				"totalCycleTime": 51,
				"totalVAT": 8,
				"tasks": [
					{
						"taskName": "Process5 - Task 1",
						"cycleTime": "3",
						"valueAddedTime": "1",
						"ownership": "Team B",
						"automation": "M"
					},
					{
						"taskName": "Process5 - Task 2",
						"cycleTime": "12",
						"valueAddedTime": "2",
						"ownership": "Team A",
						"automation": "P/A"
					},
					{
						"taskName": "Process5 - Task 3",
						"cycleTime": "24",
						"valueAddedTime": "3",
						"ownership": "Team C",
						"automation": "P/A"
					},
					{
						"taskName": "Process5 - Task 4",
						"cycleTime": "12",
						"valueAddedTime": "2",
						"ownership": "Team A",
						"automation": "M"
					}
				]
			},
			{
				"workcentre": "Process 6",
				"totalCycleTime": 25,
				"totalVAT": 14,
				"tasks": [
					{
						"taskName": "Process6 - Task 1",
						"cycleTime": "5",
						"valueAddedTime": "5",
						"ownership": "Team A",
						"automation": "A"
					},
					{
						"taskName": "Process6 - Task 2",
						"cycleTime": "14",
						"valueAddedTime": "3",
						"ownership": "Team B",
						"automation": "M"
					},
					{
						"taskName": "Process6 - Task 3",
						"cycleTime": "2",
						"valueAddedTime": "2",
						"ownership": "Team C",
						"automation": "A"
					},
					{
						"taskName": "Process6 - Task 4",
						"cycleTime": "4",
						"valueAddedTime": "4",
						"ownership": "Team D",
						"automation": "A"
					}
				]
			}
		];

		loadFromJSON(sampleJSON);

	}

	function showhideJSON() {
		// Get the container element by its ID
		const jsonContainer = document.getElementById('jsonContainer');

		// Check if the container exists
		if (!jsonContainer) {
			alert("JSON container not found.");
			return;
		}

		// Toggle the visibility of the container
		if (jsonContainer.style.display === 'none' || jsonContainer.style.display === '') {
			jsonContainer.style.display = 'block';
		} else {
			jsonContainer.style.display = 'none';
		}
	}

	//drag after element

	function getDragAfterElement(container, y) {
		const draggableElements = [...container.querySelectorAll('.input-container:not(.dragging)')];

		return draggableElements.reduce((closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		}, { offset: Number.NEGATIVE_INFINITY }).element;
	}

	//update WC order
	function updateWorkcentreOrder() {
		const container = document.getElementById('workcentres');
		const reordered = Array.from(container.querySelectorAll('.input-container'));
		workcentres = reordered.map(div => {
			console.log("WCs are - " + workcentres);
			return workcentres.find(wc => wc.workcentreName === div.querySelector('input'));
		});
		updateJSON();
		generateVSM();
	}

	//update Task Order
	function updateTaskOrder(workcentreDiv) {
		const container = workcentreDiv.querySelector('.task-container');
		const taskDivs = Array.from(container.querySelectorAll('.task'));


		// Find the workcentre object from the DOM element
		const workcentreObj = workcentres.find(wc => wc.workcentreDiv === workcentreDiv);
		if (!workcentreObj) {
			console.warn("No workcentre object found for div:", workcentreDiv);
			return;
		}

		workcentreObj.tasks = taskDivs.map(div => {
			return workcentreObj.tasks.find(task => {
				return task && task.taskName && div.contains(task.taskName);
			});
		}).filter(task => task); // Remove undefined entries


		//updateWorkcentreTotals(workcentreObj);
		updateJSON();
		generateVSM();
	}


	//Now generate teh VSM
	function generateVSM() {
		//workcentres.length < 3 ? forLessWC() : forMoreWC();
		renderVSMChart();
	}



	/**
	 * @function renderVSMChart
	 * @description Main function to render the Value Stream Map chart. It orchestrates the initialization,
	 * calculation, drawing of all VSM components (customer requirements, work centres, tasks, connections,
	 * ladders, legend), and finalizes the SVG dimensions and JSON output.
	 * Relies on a global 'workcentres' variable.
	 * @returns {void}
	 */
	function renderVSMChart() {

		const svg = initializeSVG();
		const chartData = [];
		const tooltip = createTooltip();
		const margin = { top: 20, right: 20, bottom: 200, left: 20 };
		const width = calculateWidth(svg, margin); // Note: width calculated but not explicitly used later for positioning
		const shiftX = calculateShiftX();

		const nodeWidth = 160;
		const nodeHeight = 60;
		const nodeSpacingX = 200;
		const nodeSpacingY = 80;

		const totalWorkCentersWidth = calculateTotalWorkCentersWidth(workcentres, nodeSpacingX, nodeWidth);
		const customerRequirementText = getCustomerRequirementText();

		const { customerReqX, customerReqY, customerReqWidth, customerReqHeight } = calculateCustomerReqPosition(
			shiftX, totalWorkCentersWidth, nodeWidth, workcentres.length
		);

		hideNoChartMessage();
		drawCustomerRequirements(svg, customerReqX, customerReqY, customerReqWidth, customerReqHeight, customerRequirementText);

		const workCenterStartY = customerReqY + customerReqHeight + 40;
		chartData.push({ customerRequirements: customerRequirementText });

		const teamColors = buildTeamColorMap(workcentres);

		let totalCycleTime = 0;
		let totalVAT = 0;
		let maxTaskHeight = 0; // Tracks max Y extent relative to WC top needed for tasks column
		const workcentreData = []; // Stores processed WC data for ladders

		// Loop through each workcentre
		workcentres.forEach((wc, wcIndex) => {
			// Process WC data (name, times, comments) - Note: processWorkCenterData relies on wcIndex from this scope if default naming is used.
			const { wcName, wcTotalCycleTime, wcTotalVAT, wcComments } = processWorkCenterData(wc);
			totalCycleTime += wcTotalCycleTime; // Accumulate global totals
			totalVAT += wcTotalVAT;

			// Calculate WC position
			const x = wcIndex * nodeSpacingX + shiftX;
			const y = workCenterStartY;

			// Draw WC box and text
			drawWorkCenter(svg, tooltip, x, y, nodeWidth, nodeHeight, wcName, wcComments);

			// Draw connections from/to Customer Requirements for first/last WC
			if (wcIndex === 0) {
				drawFirstWorkCenterConnection(svg, customerReqX, customerReqY, customerReqHeight, x, y, nodeWidth, nodeHeight, workcentres.length);
			}
			if (wcIndex === workcentres.length - 1) {
				drawLastWorkCenterConnection(svg, customerReqX, customerReqY, customerReqHeight, customerReqWidth,
					x, y, nodeWidth, nodeHeight, workcentres.length);
			}

			// Loop through tasks within the WC
			wc.tasks.forEach((task, taskIndex) => {
				const taskY = y + (taskIndex + 1) * nodeSpacingY; // Calculate task Y position
				const taskX = x; // Task X position is same as WC X
				drawTask(svg, tooltip, taskX, taskY, nodeWidth, nodeHeight, task, teamColors); // Draw the task element
			});

			// Update max height needed within any column for tasks
			maxTaskHeight = Math.max(maxTaskHeight, wc.tasks.length * nodeSpacingY + nodeHeight);

			// Store processed data for ladders
			workcentreData.push({
				workcentre: wcName,
				totalCycleTime: wcTotalCycleTime,
				totalVAT: wcTotalVAT,
				comments: wcComments
			});

			// Create and store structured data entry for JSON output
			chartData.push(createChartDataEntry(wc, wcName, wcTotalCycleTime, wcTotalVAT, wcComments));
		});

		// Draw lead time ladders (individual and total)
		drawLeadTimeLadders(svg, workcentreData, maxTaskHeight, workCenterStartY, shiftX, nodeSpacingX, nodeWidth,
			totalCycleTime, totalVAT);

		// Draw connecting lines
		connectWorkCenters(svg, workcentres, shiftX, nodeSpacingX, nodeWidth, nodeHeight, workCenterStartY);
		connectTasksToWorkCenters(svg, workcentres, shiftX, nodeWidth, nodeSpacingX, nodeSpacingY, workCenterStartY, nodeHeight);
		drawArrowMarker(svg); // Define SVG arrow marker
		drawLegend(svg, teamColors, shiftX, workcentres, nodeSpacingX, nodeWidth, maxTaskHeight, workCenterStartY);

		// Finalize SVG dimensions
		finalizeSVGDimensions(svg, workcentres, maxTaskHeight, workCenterStartY, shiftX, nodeSpacingX, nodeWidth);
		updateJSONOutput(chartData); // Update JSON output area
	}

	// ==========================
	// Helper functions
	// ==========================

	/**
	 * @function initializeSVG
	 * @description Selects the SVG container with ID 'vsmChart' using D3 and removes all its existing child elements.
	 * @returns {d3.Selection} The D3 selection representing the SVG element.
	 */
	function initializeSVG() {
		const svg = d3.select("#vsmChart");
		svg.selectAll("*").remove();
		return svg;
	}



	/**
	 * @function createTooltip
	 * @description Selects the HTML element with ID 'd3Tooltip' to be used for displaying tooltips.
	 * @returns {d3.Selection} The D3 selection representing the tooltip element.
	 */
	function createTooltip() {
		return d3.select("#d3Tooltip");
	}

	/**
	 * @function gettooltipShiftX
	 * Returns X offset for tooltip
	 */
	function gettooltipShiftX() {
		return 10;
	}

	/**
	 * @function gettooltipShiftY
	 * Returns Y offset for tooltip
	 */
	function gettooltipShiftY() {
		return 10;
	}


	/**
	 * @function calculateWidth
	 * @description Calculates the width of the SVG element minus the horizontal margins.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {object} margin - An object containing margin values (left, right, top, bottom).
	 * @returns {number} The calculated width.
	 */
	function calculateWidth(svg, margin) {
		return +svg.node().getBoundingClientRect().width - margin.left - margin.right;
	}

	/**
	 * @function calculateShiftX
	 * @description Calculates the horizontal starting offset (shift) for the chart elements.
	 * Uses a larger shift if there are fewer than 3 workcentres. Relies on global 'workcentres'.
	 * @returns {number} The calculated horizontal shift value.
	 */
	function calculateShiftX() {
		return workcentres.length < 3 ? 150 : 50;
	}

	/**
	 * @function calculateTotalWorkCentersWidth
	 * @description Calculates the total horizontal width spanned by the workcentre nodes, from the start
	 * of the first node to the end of the last node.
	 * @param {Array<object>} workcentres - The array of workcentre data.
	 * @param {number} nodeSpacingX - The horizontal distance between the start of adjacent workcentres.
	 * @param {number} nodeWidth - The width of a single workcentre node.
	 * @returns {number} The total calculated width.
	 */
	function calculateTotalWorkCentersWidth(workcentres, nodeSpacingX, nodeWidth) {
		return (workcentres.length - 1) * nodeSpacingX + nodeWidth;
	}

	/**
	 * @function getCustomerRequirementText
	 * @description Retrieves the trimmed text value from the HTML input element with ID 'customerRequirementInput'.
	 * Returns a default string if the element is not found or its value is empty.
	 * @returns {string} The customer requirement text or a default string.
	 */
	function getCustomerRequirementText() {
		const custReq = document.getElementById("customerRequirementInput");
		return (custReq === null || custReq === undefined || custReq.value.trim() === "")
			? "Customer Requirements"
			: custReq.value.trim();
	}

	/**
	 * @function calculateCustomerReqPosition
	 * @description Calculates the position and dimensions for the Customer Requirements box, attempting to center it
	 * horizontally above the workcentres.
	 * @param {number} shiftX - The global horizontal shift for the chart.
	 * @param {number} totalWorkCentersWidth - The total calculated width of the workcentre nodes.
	 * @param {number} nodeWidth - The standard width of a workcentre node.
	 * @param {number} workcentreCount - The number of workcentres.
	 * @returns {{customerReqX: number, customerReqY: number, customerReqWidth: number, customerReqHeight: number}} An object containing the calculated position (x, y) and dimensions.
	 */
	function calculateCustomerReqPosition(shiftX, totalWorkCentersWidth, nodeWidth, workcentreCount) {
		const customerReqWidth = nodeWidth * 2;
		const customerReqHeight = 60; // Fixed height
		let customerReqX = shiftX + (totalWorkCentersWidth - customerReqWidth) / 2;
		const customerReqY = 0; // Position at the top

		// Adjust X slightly if few workcentres for visual balance
		if (workcentreCount < 3) {
			customerReqX = customerReqX + 12;
		}

		return { customerReqX, customerReqY, customerReqWidth, customerReqHeight };
	}

	/**
	 * @function hideNoChartMessage
	 * @description Hides the HTML element with the ID 'noChartMessage' by setting its display style to 'none'.
	 * @returns {void}
	 */
	function hideNoChartMessage() {
		// Assumes element with ID 'noChartMessage' exists
		document.getElementById("noChartMessage").style.display = "none";
	}

	/**
	 * @function drawCustomerRequirements
	 * @description Draws the Customer Requirements box (a rectangle) and its text label onto the SVG.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {number} x - The x-coordinate for the top-left corner of the rectangle.
	 * @param {number} y - The y-coordinate for the top-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 * @param {string} text - The text to display centered within the rectangle.
	 * @returns {void}
	 */
	function drawCustomerRequirements(svg, x, y, width, height, text) {
		// Draw rectangle
		const g = svg.append("g"); // Group task elements

		y = y + 5;

		addRectangle(g,
			x,
			y,
			width,
			height,
			"#F6D347",
			10,
			10,
			text);

		addText(g,
			x + width / 2,
			y + height / 2,
			"0.35em", "black",
			"14px",
			"middle",
			text,
			text);
	}

	/**
	 * @function buildTeamColorMap
	 * @description Creates a mapping from unique team names (found in task ownership fields) to distinct colors.
	 * Iterates through all tasks in the provided workcentres data to find unique teams.
	 * @param {Array<object>} workcentres - The array of workcentre data objects.
	 * @returns {object} An object where keys are team names (string) and values are color codes (string).
	 */
	function buildTeamColorMap(workcentres) {
		const teamColors = {};
		const allTeams = new Set(); // To store unique team names

		// Collect all unique team names
		workcentres.forEach(wc => {
			wc.tasks.forEach(task => {
				if (task.ownershipField?.value) {
					task.ownershipField.value.split(',').map(t => t.trim()).forEach(t => allTeams.add(t));
				}
			});
		});

		// Predefined list of colors
		const safeColors = [
			"#8e44ad", "#f39c12", "#16a085", "#d35400", "#2c3e50",
			"#7f8c8d", "#c0392b", "#27ae60", "#2980b9", "#e67e22"
		];

		// Assign colors from the list to each unique team
		Array.from(allTeams).forEach((team, index) => {
			teamColors[team] = safeColors[index % safeColors.length]; // Cycle through colors if needed
		});

		return teamColors;
	}

	/**
	 * @function processWorkCenterData
	 * @description Processes data for a single workcentre object. It calculates the total cycle time and VAT
	 * by summing the respective values from its tasks and retrieves the workcentre name and comments.
	 * Note: Default naming (e.g., `WC ${wcIndex + 1}`) requires `wcIndex` to be available from the calling scope.
	 * @param {object} wc - The workcentre data object.
	 * @returns {{wcName: string, wcTotalCycleTime: number, wcTotalVAT: number, wcComments: string}} An object containing the processed name, total times, and comments.
	 */
	function processWorkCenterData(wc) {
		// This line relies on wcIndex being available in the scope where this function is called.
		const wcName = wc.workcentreName.value || `WC ${wcIndex + 1}`;
		const wcTotalCycleTime = wc.tasks.reduce((sum, task) => sum + parseFloat(task.cycleTime.value || 0), 0);
		const wcTotalVAT = wc.tasks.reduce((sum, task) => sum + parseFloat(task.valueAddedTime.value || 0), 0);
		const wcComments = wc.commentsField.value;

		return { wcName, wcTotalCycleTime, wcTotalVAT, wcComments };
	}


	/**
	 * @function appendLine
	 * Appends an SVG line element to a given SVG container (D3 selection).
	 *
	 * @param {d3.Selection} svg - The D3 selection of the SVG container to append the line to.
	 * @param {number} x1 - The x-coordinate of the line's starting point.
	 * @param {number} x2 - The x-coordinate of the line's ending point.
	 * @param {number} y1 - The y-coordinate of the line's starting point.
	 * @param {number} y2 - The y-coordinate of the line's ending point.
	 * @param {string} strokeColor - The color of the line (e.g., "black", "#FF0000").
	 * @param {boolean} isEnd - If true, adds an arrowhead marker ('#arrow') to the end of the line.
	 */

	function appendLine(svg, x1, x2, y1, y2, strokeColor, isEnd) {
		svg.append("line")
			.attr("x1", x1)
			.attr("x2", x2)
			.attr("y1", y1) // From WC vertical middle
			.attr("y2", y2)
			.attr("stroke", strokeColor)
			.attr("stroke-width", 2)
			.attr("marker-end", isEnd ? "url(#arrow)" : null);
	}


	function addText(svg, x, y, dy, fill, fontSize, textAnchor, txt, tooltipTxt) {
		const tooltip = createTooltip();

		svg.append("text")
			.attr("x", x)
			.attr("y", y)
			.attr("dy", dy)
			.attr("fill", fill)
			.style("font-size", fontSize ? fontSize : "12px")
			.attr("text-anchor", textAnchor)
			.text(txt)
		bindToolTip(tooltip, svg, tooltipTxt);
	}


	function addRectangle(svg, x, y, width, height, fill, rx, ry, txt) {
		const tooltip = createTooltip();
		svg.append("rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", width)
			.attr("height", height)
			.attr("fill", fill)
			.attr("rx", rx)
			.attr("ry", ry)
		bindToolTip(tooltip, svg, txt);
	}


	function bindToolTip(tooltip, ele, tooltipMessage) {
		ele
			.on("mouseover", function(event) { // Tooltip show on hover
				d3.select(this).classed("glow-effect", true);
				d3.select(this).style("cursor", "pointer");
				tooltip
					.style("opacity", 1)
					.html(tooltipMessage); // Show comments or default text
			})
			.on("mousemove", function(event) { // Tooltip follow mouse
				d3.select(this).style("cursor", "pointer");
				tooltip
					.style("left", event.pageX + gettooltipShiftX() + "px")
					.style("top", event.pageY + gettooltipShiftY() + "px");
			})
			.on("mouseout", function() { // Tooltip hide on mouse out
				d3.select(this).classed("glow-effect", false);
				tooltip.style("opacity", 0);
			});
	}


	/**
	 * @function drawWorkCenter
	 * @description Draws a single workcentre node, consisting of a colored rectangle and the workcentre name text.
	 * Attaches mouse event handlers to the rectangle for showing/hiding a tooltip with comments.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {d3.Selection} tooltip - The D3 selection of the tooltip element.
	 * @param {number} x - The x-coordinate for the workcentre rectangle.
	 * @param {number} y - The y-coordinate for the workcentre rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 * @param {string} name - The name of the workcentre.
	 * @param {string} comments - The comments to display in the tooltip.
	 * @returns {void}
	 */
	function drawWorkCenter(svg, tooltip, x, y, width, height, name, comments) {
		// Draw the rectangle
		const g = svg.append("g"); // Group task elements

		addRectangle(g,
			x,
			y,
			width,
			height,
			"#007bff",
			10,
			10,
			comments);

		addText(g,
			x + width / 2,
			y + height / 2,
			"0.35em",
			"white",
			"14px",
			"middle",
			name,
			comments || "No Comments");

	}

	/**
	 * @function drawFirstWorkCenterConnection
	 * @description Draws the connecting lines from the Customer Requirements box to the first workcentre box.
	 * The style of the connection (elbow or diagonal) depends on the total workcentre count.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {number} customerReqX - X-coordinate of the customer requirements box.
	 * @param {number} customerReqY - Y-coordinate of the customer requirements box.
	 * @param {number} customerReqHeight - Height of the customer requirements box.
	 * @param {number} x - X-coordinate of the first workcentre box.
	 * @param {number} y - Y-coordinate of the first workcentre box.
	 * @param {number} nodeWidth - Width of a workcentre node.
	 * @param {number} nodeHeight - Height of a workcentre node.
	 * @param {number} workcentreCount - The total number of workcentres.
	 * @returns {void}
	 */
	function drawFirstWorkCenterConnection(svg, customerReqX, customerReqY, customerReqHeight, x, y, nodeWidth, nodeHeight, workcentreCount) {
		if (workcentreCount < 3) { // Elbow style connection
			let arrowLeftCoordinate = customerReqX - nodeWidth / 2; // X for vertical segment

			// Horizontal segment from Customer Req    
			appendLine(svg, customerReqX, arrowLeftCoordinate, customerReqY + customerReqHeight / 2, customerReqY + customerReqHeight / 2, "#999", 0);

			appendLine(svg, arrowLeftCoordinate, arrowLeftCoordinate, customerReqY + customerReqHeight / 2, y + nodeHeight / 2, "#999", 0);

			appendLine(svg, arrowLeftCoordinate, x, y + nodeHeight / 2, y + nodeHeight / 2, "#999", 1);


		} else { // Diagonal style connection
			// Coordinate calculation seems complex, might need review for exact positioning intention
			let arrowLeftCoordinate = customerReqX - (customerReqX - x - nodeWidth / 2);
			// Short horizontal segment from Customer Req (potentially length 0)
			appendLine(svg, customerReqX, arrowLeftCoordinate, customerReqY + customerReqHeight / 2, customerReqY + customerReqHeight / 2, "#999", 0);

			appendLine(svg, arrowLeftCoordinate, x + nodeWidth / 2, customerReqY + customerReqHeight / 2, y, "#999", 1);

		}
	}

	/**
	 * @function drawLastWorkCenterConnection
	 * @description Draws the connecting lines from the last workcentre box back to the Customer Requirements box.
	 * The style of the connection (elbow or two-segment) depends on the total workcentre count.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {number} customerReqX - X-coordinate of the customer requirements box.
	 * @param {number} customerReqY - Y-coordinate of the customer requirements box.
	 * @param {number} customerReqHeight - Height of the customer requirements box.
	 * @param {number} customerReqWidth - Width of the customer requirements box.
	 * @param {number} x - X-coordinate of the last workcentre box.
	 * @param {number} y - Y-coordinate of the last workcentre box.
	 * @param {number} nodeWidth - Width of a workcentre node.
	 * @param {number} nodeHeight - Height of a workcentre node.
	 * @param {number} workcentreCount - The total number of workcentres.
	 * @returns {void}
	 */
	function drawLastWorkCenterConnection(svg, customerReqX, customerReqY, customerReqHeight, customerReqWidth,
		x, y, nodeWidth, nodeHeight, workcentreCount) {
		if (workcentreCount < 3) { // Elbow style connection
			// Calculate X for vertical segment based on Customer Req and node widths
			let arrowRightCoordinate = customerReqWidth + nodeWidth * 2 - 50;
			if (workcentreCount < 2) { // Adjust calculation if only one WC
				arrowRightCoordinate = customerReqWidth + nodeWidth;
			}
			// Horizontal segment from WC right edge
			appendLine(svg, x + nodeWidth, arrowRightCoordinate, y + nodeHeight / 2, y + nodeHeight / 2, "#999", 0);
			// Vertical segment up
			appendLine(svg, arrowRightCoordinate, arrowRightCoordinate, y + nodeHeight / 2, customerReqHeight / 2, "#999", 0);
			// Horizontal segment to Customer Req right edge (with arrow)
			appendLine(svg, arrowRightCoordinate, customerReqX + customerReqWidth, customerReqY + customerReqHeight / 2, customerReqY + customerReqHeight / 2, "#999", 1);

		} else { // Two-segment style connection
			// Vertical line up from WC top-center
			appendLine(svg, x + nodeWidth / 2, x + nodeWidth / 2, y, customerReqY + customerReqHeight / 2, "#999", 0);
			// Horizontal line to Customer Req right edge (with arrow)
			appendLine(svg, x + nodeWidth / 2, customerReqX + customerReqWidth, customerReqY + customerReqHeight / 2, customerReqY + customerReqHeight / 2, "#999", 1);

		}
	}

	/**
	 * @function drawTask
	 * @description Draws a single task node, including the main rectangle, a bottom border colored by team,
	 * task name, cycle time/VAT text, automation status indicator, and tooltip interactions.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {d3.Selection} tooltip - The D3 selection of the tooltip element.
	 * @param {number} x - The x-coordinate for the task rectangle.
	 * @param {number} y - The y-coordinate for the task rectangle.
	 * @param {number} width - The width of the task rectangle.
	 * @param {number} height - The height of the task rectangle.
	 * @param {object} task - The task data object, containing details like name, times, comments, ownership, etc.
	 * @param {object} teamColors - The map of team names to color codes.
	 * @returns {void}
	 */
	function drawTask(svg, tooltip, x, y, width, height, task, teamColors) {
		const g = svg.append("g"); // Group task elements

		// Determine team color (first team listed, default grey)
		let taskTeams = task.ownershipField?.value?.split(',').map(t => t.trim()) || [];
		let teamColor = teamColors[taskTeams[0]] || "#6c757d";

		let msg = (task.taskComments?.value || "No comments");

		addRectangle(g, x, y, width, height, "#6c757d", 8, 8, msg);

		addRectangle(g, x, y + height - 4, width, 5, teamColor, 2, 0, task.ownershipField.value);


		// Task name text
		let automationStatus = task.getAutomation();
		automationStatus = (automationStatus === 'A') ? 'Automated' :
			(automationStatus === 'P/A') ? 'Partially Automated' :
				'Manual';

		let comm = (task.taskComments?.value || "No comments");
		let msg1 = task.taskName.value +
			"\n" + "Ownership : " + task.ownershipField.value +
			"\n" + `CT: ${task.cycleTime.value}, VAT: ${task.valueAddedTime.value}` +
			"\n" + "Automation : " + automationStatus +
			"\n" + ("Comments : " + comm);

		addText(g,
			x + width / 2,
			y + 20,
			"0.35em",
			"white",
			"10px",
			"middle",
			task.taskName.value, msg1);

		const yOffset = y + 40; // Position Y (near bottom)
		const timesTxt = `CT: ${task.cycleTime.value}, VAT: ${task.valueAddedTime.value}`;
		addText(g,
			x + width / 2,
			yOffset,
			"0.35em",
			"white",
			"10px",
			"middle",
			timesTxt,
			msg1);

		// Draw the automation status indicator (circle + text)
		drawAutomationStatus(svg, x, y, width, height, task);

	}

	/**
	 * @function drawAutomationStatus
	 * @description Draws the automation status indicator (circle and text: 'A', 'P/A', or 'M') for a given task.
	 * Position and color vary based on the status retrieved from task.getAutomation().
	 * @param {d3.Selection} g - The D3 group selection (<g>) to append the indicator elements to.
	 * @param {number} x - The x-coordinate of the parent task rectangle.
	 * @param {number} y - The y-coordinate of the parent task rectangle.
	 * @param {number} width - The width of the parent task rectangle.
	 * @param {number} height - The height of the parent task rectangle.
	 * @param {object} task - The task data object, must have a `getAutomation` method returning 'A', 'P/A', or 'M'.
	 * @returns {void}
	 */
	function drawAutomationStatus(svg, x, y, width, height, task) {
		g = svg.append("g");
		const tooltip = createTooltip();
		const automationStatus = task.getAutomation(); // Get status ('A', 'P/A', 'M')
		const indicatorY = y + height / 2; // Vertical center

		let tooltipText = "";
		if (automationStatus === "A") { // Automated - Left, Green/White

			tooltipText = task.taskName.value + " is Automated";

			const indicatorX = x; // Left edge
			// Circle
			g.append("circle")
				.attr("cx", indicatorX)
				.attr("cy", indicatorY)
				.attr("r", 8) // Radius
				.attr("fill", "white")
				.attr("stroke-width", 1)
				.attr("stroke", "green")
			// --- Tooltip Interaction ---
			bindToolTip(tooltip, g, tooltipText);

			// Text 'A'
			addText(g,
				indicatorX,
				indicatorY,
				"0.35em",
				"green",
				"10px",
				"middle",
				"A",
				task.taskName.value + " is Automated");

		} else if (automationStatus == "P/A") { // Partially Automated - Left, Purple
			const indicatorX = x; // Left edge
			// Circle
			tooltipTxt = task.taskName.value + " is Partially Automated";
			g.append("circle")
				.attr("cx", indicatorX)
				.attr("cy", indicatorY)
				.attr("r", 8) // Radius
				.attr("fill", "#8548a8") // Purple fill
				.attr("stroke-width", 1)
				.attr("stroke", "#8548a8") // Purple border
			bindToolTip(tooltip, g, tooltipText);

			// Text 'P/A'
			addText(g,
				indicatorX,
				indicatorY,
				"0.35em",
				"white",
				"10px",
				"middle",
				"P/A",
				task.taskName.value + " is Partially Automated");

		} else { // Manual (Default) - Right, Red/White
			const indicatorX = x + width; // Right edge
			// Circle
			tooltipText = task.taskName.value + " is Manual";

			g.append("circle")
				.attr("cx", indicatorX)
				.attr("cy", indicatorY)
				.attr("r", 8) // Radius
				.attr("stroke", "red")
				.attr("stroke-width", 1)
				.attr("fill", "white")
			bindToolTip(tooltip, g, tooltipText);

			// Text 'M'
			addText(g,
				indicatorX,
				indicatorY,
				"0.35em",
				"red",
				"10px",
				"middle",
				"M",
				task.taskName.value + " is Manual");
		}
	}

	/**
	 * @function createChartDataEntry
	 * @description Creates a structured data object for a single workcentre, including details of its tasks.
	 * This object is intended for the final JSON output array.
	 * @param {object} wc - The raw workcentre data object from the input 'workcentres' array.
	 * @param {string} wcName - The name of the workcentre (potentially derived).
	 * @param {number} wcTotalCycleTime - The calculated total cycle time for this workcentre.
	 * @param {number} wcTotalVAT - The calculated total value-added time for this workcentre.
	 * @param {string} wcComments - The comments associated with the workcentre.
	 * @returns {object} A structured object representing the workcentre and its tasks.
	 */
	function createChartDataEntry(wc, wcName, wcTotalCycleTime, wcTotalVAT, wcComments) {
		return {
			workcentre: wcName,
			totalCycleTime: wcTotalCycleTime,
			totalVAT: wcTotalVAT,
			comments: wcComments,
			tasks: wc.tasks.map(task => ({ // Map tasks to a simpler structure
				taskName: task.taskName.value,
				cycleTime: task.cycleTime.value,
				valueAddedTime: task.valueAddedTime.value,
				ownership: task.ownershipField.value,
				automation: task.getAutomation(), // Include automation status
				comments: task.taskComments.value
			}))
		};
	}

	/**
	 * @function drawLeadTimeLadders
	 * @description Draws the lead time ladders (VAT/NVAT bars) below the workcentre/task area.
	 * Includes individual ladders aligned under each workcentre and a total ladder spanning the width.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {Array<object>} workcentreData - Array of processed workcentre data containing names and total times.
	 * @param {number} maxTaskHeight - The maximum vertical space occupied by tasks within any single column (relative to WC top).
	 * @param {number} workCenterStartY - The Y-coordinate of the top of the workcentre boxes.
	 * @param {number} shiftX - The global horizontal shift for the chart.
	 * @param {number} nodeSpacingX - The horizontal distance between the start of adjacent workcentres.
	 * @param {number} nodeWidth - The width of a workcentre node.
	 * @param {number} totalCycleTime - The overall total cycle time for all workcentres.
	 * @param {number} totalVAT - The overall total value-added time for all workcentres.
	 * @returns {void}
	 */
	function drawLeadTimeLadders(svg, workcentreData, maxTaskHeight, workCenterStartY, shiftX, nodeSpacingX, nodeWidth,
		totalCycleTime, totalVAT) {


		// Y position for the top of the individual ladders
		const ladderY = maxTaskHeight + 20 + workCenterStartY; // Below tasks + padding
		const tooltip = createTooltip();
		// Draw individual ladders per workcentre
		workcentreData.forEach((wc, wcIndex) => {
			const x = wcIndex * nodeSpacingX + shiftX; // Align X with workcentre
			// Calculate width proportions (VAT vs NVAT) - Note: variable names say Height but calculate width
			const valueAddedWidth = (wc.totalVAT / wc.totalCycleTime) * nodeWidth || 0; // Width for VAT part, default 0
			const nonValueAddedWidth = nodeWidth - valueAddedWidth; // Width for NVAT part

			let tooltipText = wc.workcentre +
				"\nVAT = " + wc.totalVAT +
				"\nTime taken = " + wc.totalCycleTime;

			g = svg.append("g");


			addRectangle(g,
				x,
				ladderY,
				valueAddedWidth,
				20,
				"#28a745",
				0,
				0,
				tooltipText)


			addText(g,
				x + valueAddedWidth / 2,
				ladderY + 10,
				"0.35em",
				"#fff",
				"14px",
				"middle",
				wc.totalVAT.toFixed(1),
				tooltipText);


			// Calculate NVAT value
			const difference = wc.totalCycleTime - wc.totalVAT;


			if (difference > 0) { // Only draw NVAT part if it exists

				g = svg.append("g");
				tooltipText = wc.workcentre +
					"\nNVAT = " + difference +
					"\nTime taken = " + wc.totalCycleTime;

				addRectangle(g,
					x + valueAddedWidth,
					ladderY,
					nonValueAddedWidth,
					20,
					"#ED6A61",
					0,
					0,
					tooltipText)


				addText(g,
					x + valueAddedWidth + nonValueAddedWidth / 2,
					ladderY + 10,
					"0.35em",
					"#fff",
					"14px",
					"middle",
					difference.toFixed(1),
					tooltipText);

			}
		});

		// Draw the total ladder below individual ones
		const bottomLadderY = ladderY + 25; // Y position for total ladder
		// Calculate total width for the ladder (approximate span of workcentres)
		const ladderTotalWidth = workcentreData.length * nodeSpacingX - 40; // Needs review - calculation seems arbitrary
		// Calculate width proportions for total VAT/NVAT - Note: variable names say Height but calculate width
		const totalValueAddedWidth = (totalVAT / totalCycleTime) * ladderTotalWidth || 0; // Total VAT width, default 0
		const totalNonValueAddedWidth = (totalValueAddedWidth > 0 || workcentreData.length > 1)
			? ladderTotalWidth - totalValueAddedWidth
			: 0;


		// Calculate NVAT value
		g = svg.append("g");

		tooltipText = "Total VAT = " + totalVAT +
			"\nTotal Time taken = " + totalCycleTime;

		//Total VAT Ladder        	 
		addRectangle(g,
			shiftX,
			bottomLadderY,
			totalValueAddedWidth,
			20,
			"#28a745",
			0,
			0,
			tooltipText);


		addText(g,
			shiftX + totalValueAddedWidth / 2,
			bottomLadderY + 10,
			"0.35em",
			"#fff",
			"14px",
			"middle",
			totalVAT.toFixed(1),
			tooltipText);


		//Total NVAT Ladder
		tooltipText = "Total NVAT = " + (totalCycleTime - totalVAT) +
			"\nTotal Time taken = " + totalCycleTime;

		g = svg.append("g");

		addRectangle(g,
			shiftX + totalValueAddedWidth,
			bottomLadderY,
			totalNonValueAddedWidth,
			20,
			"#ED6A61",
			0,
			0,
			tooltipText);


		addText(g,
			shiftX + totalValueAddedWidth + totalNonValueAddedWidth / 2,
			bottomLadderY + 10,
			"0.35em",
			"#fff",
			"14px",
			"middle",
			(totalCycleTime - totalVAT).toFixed(1),
			tooltipText);

	}

	/**
	 * @function connectWorkCenters
	 * @description Draws horizontal connecting lines with arrows between adjacent workcentre nodes.
	 * Lines connect the vertical midpoint of the right edge of one WC to the left edge of the next.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {Array<object>} workcentres - The array of workcentre data.
	 * @param {number} shiftX - The global horizontal shift for the chart.
	 * @param {number} nodeSpacingX - The horizontal distance between the start of adjacent workcentres.
	 * @param {number} nodeWidth - The width of a workcentre node.
	 * @param {number} nodeHeight - The height of a workcentre node.
	 * @param {number} workCenterStartY - The Y-coordinate of the top of the workcentre boxes.
	 * @returns {void}
	 */
	function connectWorkCenters(svg, workcentres, shiftX, nodeSpacingX, nodeWidth, nodeHeight, workCenterStartY) {
		const connectionY = workCenterStartY + nodeHeight / 2; // Y level for connections

		workcentres.forEach((wc, wcIndex) => {
			// Draw line only if there is a next workcentre
			if (wcIndex < workcentres.length - 1) {
				const startX = wcIndex * nodeSpacingX + shiftX + nodeWidth; // Right edge of current WC
				const nextX = (wcIndex + 1) * nodeSpacingX + shiftX;       // Left edge of next WC

				// Draw line with arrow
				appendLine(svg, startX, nextX, connectionY, connectionY, "#999", 1);

			}
		});
	}

	/**
	 * @function connectTasksToWorkCenters
	 * @description Draws vertical lines within each workcentre column to connect tasks sequentially.
	 * A line goes from the bottom-center of the workcentre box to the top-center of the first task,
	 * and then from the bottom-center of each task to the top-center of the next task below it.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {Array<object>} workcentres - The array of workcentre data, each containing tasks.
	 * @param {number} shiftX - The global horizontal shift for the chart.
	 * @param {number} nodeWidth - The width of a node (for centering).
	 * @param {number} nodeSpacingX - The horizontal distance between the start of adjacent workcentres.
	 * @param {number} nodeSpacingY - The vertical distance between the start of adjacent tasks.
	 * @param {number} workCenterStartY - The Y-coordinate of the top of the workcentre boxes.
	 * @param {number} nodeHeight - The height of a node (task/WC).
	 * @returns {void}
	 */
	function connectTasksToWorkCenters(svg, workcentres, shiftX, nodeWidth, nodeSpacingX, nodeSpacingY, workCenterStartY, nodeHeight) {
		workcentres.forEach((wc, wcIndex) => {
			const x = wcIndex * nodeSpacingX + shiftX;      // X for the current column
			const lineCenterX = x + nodeWidth / 2; // Center X for vertical lines

			wc.tasks.forEach((task, taskIndex) => {
				const taskTopY = workCenterStartY + (taskIndex + 1) * nodeSpacingY; // Y of task top edge
				let lineStartY; // Y where the connecting line should start

				if (taskIndex === 0) {
					// First task connects from the bottom of the WC box
					lineStartY = workCenterStartY + nodeHeight;
				} else {
					// Subsequent tasks connect from the bottom of the *previous* task
					lineStartY = workCenterStartY + taskIndex * nodeSpacingY + nodeHeight; // Bottom of previous task
				}

				// Draw the vertical line segment
				appendLine(svg, lineCenterX, lineCenterX, lineStartY, taskTopY, "#999", 0);

			});
		});
	}

	/**
	 * @function drawArrowMarker
	 * @description Defines an SVG arrow marker within the `<defs>` section of the SVG.
	 * This marker can be applied to lines using the 'marker-end' attribute (e.g., `marker-end="url(#arrow)"`).
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @returns {void}
	 */
	function drawArrowMarker(svg) {
		// Ensure defs section exists
		let defs = svg.select("defs");
		if (defs.empty()) {
			defs = svg.append("defs");
		}
		// Define the marker (overwrites if already exists with same ID)
		defs.append("marker")
			.attr("id", "arrow")           // ID for referencing
			.attr("viewBox", "0 0 10 10") // Coordinate system within the marker
			.attr("refX", 5)              // Reference point X (center of the viewbox)
			.attr("refY", 5)              // Reference point Y (center of the viewbox)
			.attr("markerWidth", 6)       // Display width of the marker
			.attr("markerHeight", 6)      // Display height of the marker
			.attr("orient", "auto")       // Auto-rotate marker to line angle
			.append("path")
			.attr("d", "M0,0 L10,5 L0,10") // Path for a simple triangle arrow
			.attr("fill", "#999");        // Arrow color
	}

	/**
	 * @function drawLegend
	 * @description Draws a legend displaying team names and their corresponding colors.
	 * Positions the legend horizontally, attempting to center it below the workcentres.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {object} teamColors - An object mapping team names to color codes.
	 * @param {number} shiftX - The global horizontal shift for the chart.
	 * @param {Array<object>} workcentres - The array of workcentre data.
	 * @param {number} nodeSpacingX - The horizontal distance between the start of adjacent workcentres.
	 * @param {number} nodeWidth - The width of a workcentre node.
	 * @param {number} maxTaskHeight - The maximum vertical space occupied by tasks within any column (relative to WC top).
	 * @param {number} workCenterStartY - The Y-coordinate of the top of the workcentre boxes.
	 * @returns {void}
	 */
	function drawLegend(svg, teamColors, shiftX, workcentres, nodeSpacingX, nodeWidth, maxTaskHeight, workCenterStartY) {
		const allTeams = Object.keys(teamColors);
		if (allTeams.length === 0) return; // Don't draw if no teams

		// Calculate approximate position for the legend
		const firstWorkCenterX = shiftX;
		const lastWorkCenterX = (workcentres.length - 1) * nodeSpacingX + shiftX + nodeWidth;
		const totalWorkCenterWidth = lastWorkCenterX - firstWorkCenterX;

		const legendItemWidth = 150; // Estimated width per legend item
		// Calculate starting X to center the legend block below WCs
		let legendX = firstWorkCenterX + (totalWorkCenterWidth - (allTeams.length * legendItemWidth)) / 2;
		legendX = Math.max(shiftX, legendX); // Ensure it doesn't go left of shiftX

		// Calculate starting Y below ladders
		const legendY = maxTaskHeight + workCenterStartY + 100; // Position below tasks/ladders + padding

		// Draw legend items horizontally
		allTeams.forEach(team => {
			// Draw color swatch (rectangle)

			svg.append("rect")
				.attr("x", legendX)
				.attr("y", legendY)
				.attr("width", 20)  // Swatch width
				.attr("height", 20) // Swatch height
				.attr("fill", teamColors[team]); // Use team color

			// Draw team name text
			svg.append("text")
				.attr("x", legendX + 25) // Position text next to swatch
				.attr("y", legendY + 10) // Align text vertically with swatch center
				.attr("dy", ".35em")
				.text(team);

			legendX += legendItemWidth; // Move X for the next legend item
		});
	}

	/**
	 * @function finalizeSVGDimensions
	 * @description Sets the final height and width styles for the SVG container element.
	 * Calculates height based on the lowest elements and width based on the horizontal extent, with adjustments.
	 * @param {d3.Selection} svg - The D3 selection of the SVG element.
	 * @param {Array<object>} workcentres - The array of workcentre data.
	 * @param {number} maxTaskHeight - The maximum vertical space occupied by tasks within any column (relative to WC top).
	 * @param {number} workCenterStartY - The Y-coordinate of the top of the workcentre boxes.
	 * @param {number} shiftX - The global horizontal shift for the chart.
	 * @param {number} nodeSpacingX - The horizontal distance between the start of adjacent workcentres.
	 * @param {number} nodeWidth - The width of a workcentre node.
	 * @returns {void}
	 */
	function finalizeSVGDimensions(svg, workcentres, maxTaskHeight, workCenterStartY, shiftX, nodeSpacingX, nodeWidth) {
		// Calculate total height needed (approximate, includes bottom padding)
		const totalHeight = maxTaskHeight + workCenterStartY + 150; // Based on tasks + WC start + bottom margin/padding
		svg.style("height", `${totalHeight}px`); // Set height style

		// Calculate total width needed (approximate)
		const ladderTotalWidth = workcentres.length * nodeSpacingX - 40; // Reuses ladder width calculation (needs review)
		let totalWidth = ladderTotalWidth + 150; // Base width calculation
		if (workcentres.length < 3) { // Wider adjustment if few WCs
			totalWidth = ladderTotalWidth + 500; // Arbitrary wider value
		}

		svg.style("width", `${totalWidth}px`); // Set width style
		// Note: Using viewBox might be preferable for scalability over fixed styles.
	}

	/**
	 * @function updateJSONOutput
	 * @description Updates the value of the HTML element with ID 'jsonOutput' with a
	 * pretty-printed JSON string representation of the provided chart data.
	 * @param {Array<object>} chartData - The array of structured data objects representing the chart content.
	 * @returns {void}
	 */
	function updateJSONOutput(chartData) {
		// Assumes element with ID 'jsonOutput' exists and is an input/textarea
		document.getElementById('jsonOutput').value = JSON.stringify(chartData, null, 2); // Pretty print JSON
	}
	 