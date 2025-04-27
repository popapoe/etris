let CELL_SIZE = 20;

class Bindings {
	constructor() {
		this.key_to_action = {
			"ArrowLeft": "left",
			"ArrowRight": "right",
			"ArrowDown": "down",
			"Space": "hard drop",
			"KeyZ": "rotate ccw",
			"KeyX": "rotate cw",
			"ShiftLeft": "rotate 180",
			"ControlLeft": "hold",
		};
		this.action_to_key = {};
		for(let key in this.key_to_action) {
			let action = this.key_to_action[key];
			this.action_to_key[action] = key;
		}
	}
	bind(action, key) {
		let old_key = this.action_to_key[action];
		let old_action;
		if(key in this.key_to_action) {
			old_action = this.key_to_action[key];
			this.key_to_action[old_key] = old_action;
			this.action_to_key[old_action] = old_key;
		} else {
			old_action = null;
			delete this.key_to_action[old_key];
		}
		this.key_to_action[key] = action;
		this.action_to_key[action] = key;
		return old_action;
	}
}

class State {
	constructor(game) {
		this.game = game;
		this.das = 100;
		this.arr = 0;
		this.soft_drop_das = 100;
		this.soft_drop_arr = 0;
		this.is_arr_expired = false;
		this.is_soft_drop_arr_expired = false;
		this.is_left_pressed = false;
		this.is_right_pressed = false;
		this.counter = 0;
		this.timeline = new PriorityQueue(function(left, right) {
			let [ left_time, left_counter, ] = left;
			let [ right_time, right_counter, ] = right;
			if(left_time !== right_time) {
				return left_time - right_time;
			} else {
				return left_counter - right_counter;
			}
		});
	}
	insert(time, event) {
		this.timeline.insert([ time, this.counter, event ]);
		this.counter++;
	}
	press(action) {
		switch(action) {
		case "left":
			this.insert(document.timeline.currentTime, "press left");
			break;
		case "right":
			this.insert(document.timeline.currentTime, "press right");
			break;
		case "down":
			this.insert(document.timeline.currentTime, "press down");
			break;
		case "hard drop":
			this.insert(document.timeline.currentTime, "hard drop");
			break;
		case "rotate ccw":
			this.insert(document.timeline.currentTime, "rotate ccw");
			break;
		case "rotate cw":
			this.insert(document.timeline.currentTime, "rotate cw");
			break;
		case "rotate 180":
			this.insert(document.timeline.currentTime, "rotate 180");
			break;
		case "hold":
			this.insert(document.timeline.currentTime, "hold");
			break;
		}
		this.counter++;
	}
	release(action) {
		switch(action) {
		case "left":
			this.insert(document.timeline.currentTime, "release left");
			break;
		case "right":
			this.insert(document.timeline.currentTime, "release right");
			break;
		case "down":
			this.insert(document.timeline.currentTime, "release down");
			break;
		}
	}
	continue_soft_drop(time) {
		if(this.is_soft_drop_arr_expired) {
			this.insert(time, "down repeat");
			this.is_soft_drop_arr_expired = false;
		}
	}
	continue_horizontal(time) {
		if(this.is_arr_expired) {
			if(this.horizontal_direction === "left") {
				this.insert(time, "left repeat");
				this.is_arr_expired = false;
			}
			if(this.horizontal_direction === "right") {
				this.insert(time, "right repeat");
				this.is_arr_expired = false;
			}
		}
	}
	tick(target) {
		while(this.timeline.size() !== 0) {
			let [ time, counter, event ] = this.timeline.peek();
			if(time >= target) {
				break;
			}
			this.timeline.extract();
			switch(event) {
			case "press left":
				this.is_left_pressed = true;
				if(this.game.left()) {
					this.continue_soft_drop(time);
				}
				this.horizontal_direction = "left";
				this.insert(time + this.das, "left repeat");
				this.is_arr_expired = false;
				break;
			case "press right":
				this.is_right_pressed = true;
				if(this.game.right()) {
					this.continue_soft_drop(time);
				}
				this.horizontal_direction = "right";
				this.insert(time + this.das, "right repeat");
				this.is_arr_expired = false;
				break;
			case "press down":
				this.is_soft_dropping = true;
				if(this.game.down()) {
					this.continue_horizontal(time);
				}
				this.insert(time + this.soft_drop_das, "down repeat");
				this.is_soft_drop_arr_expired = true;
				break;
			case "release left":
				this.is_left_pressed = false;
				if(this.horizontal_direction === "left") {
					if(this.is_right_pressed) {
						this.horizontal_direction = "right";
						this.insert(time + this.das, "right repeat");
						this.is_arr_expired = false;
					} else {
						this.horizontal_direction = "none";
						this.is_arr_expired = false;
					}
				}
				break;
			case "release right":
				this.is_right_pressed = false;
				if(this.horizontal_direction === "right") {
					if(this.is_left_pressed) {
						this.horizontal_direction = "left";
						this.insert(time + this.das, "left repeat");
						this.is_arr_expired = false;
					} else {
						this.horizontal_direction = "none";
						this.is_arr_expired = false;
					}
				}
				break;
			case "release down":
				this.is_soft_dropping = false;
				this.is_soft_drop_arr_expired = false;
				break;
			case "left repeat":
				if(this.horizontal_direction === "left") {
					if(this.game.left()) {
						this.insert(time + this.arr, "left repeat");
						this.continue_soft_drop(time);
					} else {
						this.is_arr_expired = true;
					}
				}
				break;
			case "right repeat":
				if(this.horizontal_direction === "right") {
					if(this.game.right()) {
						this.insert(time + this.arr, "right repeat");
						this.continue_soft_drop(time);
					} else {
						this.is_arr_expired = true;
					}
				}
				break;
			case "down repeat":
				if(this.is_soft_dropping) {
					if(this.game.down()) {
						this.insert(time + this.soft_drop_arr, "down repeat");
						this.continue_horizontal(time);
					} else {
						this.is_soft_drop_arr_expired = true;
					}
				}
				break;
			case "hard drop":
				this.game.drop();
				this.game.lock();
				this.game.next();
				this.continue_horizontal(time);
				this.continue_soft_drop(time);
				break;
			case "rotate ccw":
				this.game.rotate_ccw();
				this.continue_horizontal(time);
				this.continue_soft_drop(time);
				break;
			case "rotate cw":
				this.game.rotate_cw();
				this.continue_horizontal(time);
				this.continue_soft_drop(time);
				break;
			case "rotate 180":
				this.game.rotate_180();
				this.continue_horizontal(time);
				this.continue_soft_drop(time);
				break;
			case "hold":
				this.game.hold();
				this.continue_horizontal(time);
				this.continue_soft_drop(time);
				break;
			}
		}
	}
}

function main() {
	let hold_canvas = document.getElementById("hold");
	let board_canvas = document.getElementById("board");
	let queue_canvas = document.getElementById("queue");
	let messagees_ul = document.getElementById("messagees");
	let bindings_table = document.getElementById("bindings");
	let das_input = document.getElementById("das");
	let arr_input = document.getElementById("arr");
	let soft_drop_das_input = document.getElementById("soft-drop-das");
	let soft_drop_arr_input = document.getElementById("soft-drop-arr");
	hold_canvas.width = 4 * CELL_SIZE;
	hold_canvas.height = 2 * CELL_SIZE;
	board_canvas.width = 10 * CELL_SIZE;
	board_canvas.height = 20 * CELL_SIZE;
	queue_canvas.width = 4 * CELL_SIZE;
	queue_canvas.height = 14 * CELL_SIZE;
	let hold_context = hold_canvas.getContext("2d");
	let board_context = board_canvas.getContext("2d");
	let queue_context = queue_canvas.getContext("2d");
	hold_context.setTransform(CELL_SIZE, 0, 0, -CELL_SIZE, 0, 2 * CELL_SIZE);
	board_context.setTransform(CELL_SIZE, 0, 0, -CELL_SIZE, 0, 20 * CELL_SIZE);
	queue_context.setTransform(CELL_SIZE, 0, 0, -CELL_SIZE, 0, 14 * CELL_SIZE);
	let game = new Game();
	let state = new State(game);
	let reader = game.log.read();
	hold_context.fillStyle = "black";
	hold_context.fillRect(0, 0, 4, 2);
	draw_queue(queue_context, game.queue);
	draw_game(board_context, game);
	let bindings = new Bindings();
	let key_inputs = {};
	for(let action in bindings.action_to_key) {
		let tr = bindings_table.insertRow();
		let action_td = tr.insertCell();
		let key_td = tr.insertCell();
		let button = document.createElement("button");
		action_td.appendChild(button);
		button.textContent = action;
		button.onmousedown = function(event) {
			state.press(action);
		};
		button.onmouseup = function(event) {
			state.release(action);
		};
		let key_input = document.createElement("input");
		key_td.appendChild(key_input);
		key_input.value = bindings.action_to_key[action];
		key_input.onkeydown = function(event) {
			event.preventDefault();
			event.stopPropagation();
			key_input.value = event.code;
			let old_action = bindings.bind(action, event.code);
			if(old_action !== null) {
				key_inputs[old_action].value = bindings.action_to_key[old_action];
			}
		};
		key_inputs[action] = key_input;
	}
	das_input.valueAsNumber = state.das;
	arr_input.valueAsNumber = state.arr;
	soft_drop_das_input.valueAsNumber = state.soft_drop_das;
	soft_drop_arr_input.valueAsNumber = state.soft_drop_arr;
	das_input.onkeydown = function(event) {
		event.stopPropagation();
	};
	das_input.onkeyup = function(event) {
		event.stopPropagation();
	};
	das_input.onchange = function(event) {
		let value = das_input.valueAsNumber;
		if(!Number.isNaN(value)) {
			state.das = value;
		}
	};
	arr_input.onkeydown = function(event) {
		event.stopPropagation();
	};
	arr_input.onkeyup = function(event) {
		event.stopPropagation();
	};
	arr_input.onchange = function(event) {
		let value = arr_input.valueAsNumber;
		if(!Number.isNaN(value)) {
			state.arr = value;
		}
	};
	soft_drop_das_input.onkeydown = function(event) {
		event.stopPropagation();
	};
	soft_drop_das_input.onkeyup = function(event) {
		event.stopPropagation();
	};
	soft_drop_das_input.onchange = function(event) {
		let value = soft_drop_das_input.valueAsNumber;
		if(!Number.isNaN(value)) {
			state.soft_drop_das = value;
		}
	};
	soft_drop_arr_input.onkeydown = function(event) {
		event.stopPropagation();
	};
	soft_drop_arr_input.onkeyup = function(event) {
		event.stopPropagation();
	};
	soft_drop_arr_input.onchange = function(event) {
		let value = soft_drop_arr_input.valueAsNumber;
		if(!Number.isNaN(value)) {
			state.soft_drop_arr = value;
		}
	};
	window.onkeydown = function(event) {
		event.preventDefault();
		if(!event.repeat) {
			if(event.code in bindings.key_to_action) {
				state.press(bindings.key_to_action[event.code]);
			}
		}
	};
	window.onkeyup = function(event) {
		event.preventDefault();
		if(event.code in bindings.key_to_action) {
			state.release(bindings.key_to_action[event.code]);
		}
	};
	requestAnimationFrame(frame);
	function frame(target) {
		state.tick(target);
		hold_context.fillStyle = "black";
		hold_context.fillRect(0, 0, 4, 2);
		if(game.held !== "empty") {
			draw_piss(hold_context, game.held, 1, 0, "0");
		}
		draw_game(board_context, game);
		draw_queue(queue_context, game.queue);
		for(let message of reader.catch_up()) {
			let li = document.createElement("li");
			li.textContent = message;
			messagees_ul.appendChild(li);
		}
		if(!state.game.over) {
			requestAnimationFrame(frame);
		}
	}
}

function draw_game(context, game) {
	draw_board(context, game.board);
	draw_ghost(context, game.piss, game.piss_x, game.get_ghost_y(), game.piss_orientation);
	draw_piss(context, game.piss, game.piss_x, game.piss_y, game.piss_orientation);
}
function draw_board(context, board) {
	for(let y = 0; y < 20; y++) {
		for(let x = 0; x < 10; x++) {
			context.fillStyle = get_color(board.cells[y][x]);
			context.fillRect(x, y, 1, 1);
		}
	}
}
function draw_queue(context, queue) {
	context.fillStyle = "black";
	context.fillRect(0, 0, 4, 14);
	for(let index = 0; index < 5; index++) {
		draw_piss(context, queue.peek(index), 1, 12 - 3 * index, "0");
	}
}
function draw_piss(context, piss, center_x, center_y, orientation) {
	for(let [ offset_x, offset_y ] of get_offsets(piss, orientation)) {
		let x = center_x + offset_x;
		let y = center_y + offset_y;
		context.fillStyle = get_color(piss);
		context.fillRect(x, y, 1, 1);
	}
}
function draw_ghost(context, piss, center_x, center_y, orientation) {
	for(let [ offset_x, offset_y ] of get_offsets(piss, orientation)) {
		let x = center_x + offset_x;
		let y = center_y + offset_y;
		context.fillStyle = "dimgray";
		context.fillRect(x, y, 1, 1);
	}
}
