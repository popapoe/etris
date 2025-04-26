let CELL_SIZE = 20;

function main() {
	let hold_canvas = document.getElementById("hold");
	let board_canvas = document.getElementById("board");
	let queue_canvas = document.getElementById("queue");
	let messagees_ul = document.getElementById("messagees");
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
	let reader = game.log.read();
	hold_context.fillStyle = "black";
	hold_context.fillRect(0, 0, 4, 2);
	draw_queue(queue_context, game.queue);
	draw_game(board_context, game);
	window.onkeydown = function(event) {
		event.preventDefault();
		switch(event.code) {
		case "ArrowLeft":
			game.left();
			draw_game(board_context, game);
			break;
		case "ArrowRight":
			game.right();
			draw_game(board_context, game);
			break;
		case "ArrowDown":
			game.down();
			draw_game(board_context, game);
			break;
		case "Space":
			game.drop();
			game.lock();
			game.next();
			draw_game(board_context, game);
			draw_queue(queue_context, game.queue);
			for(let message of reader.catch_up()) {
				let li = document.createElement("li");
				li.textContent = message;
				messagees_ul.appendChild(li);
			}
			break;
		case "KeyZ":
			game.rotate_ccw();
			draw_game(board_context, game);
			break;
		case "KeyX":
			game.rotate_cw();
			draw_game(board_context, game);
			break;
		case "ShiftLeft":
			game.rotate_180();
			draw_game(board_context, game);
			break;
		case "ControlLeft":
			game.hold();
			hold_context.fillStyle = "black";
			hold_context.fillRect(0, 0, 4, 2);
			draw_piss(hold_context, game.held, 1, 0, "0");
			draw_game(board_context, game);
			draw_queue(queue_context, game.queue);
			break;
		}
	};
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
