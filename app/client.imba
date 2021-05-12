global css @root
	ff: 'Open Sans', sans-serif;

global css body
	w:100%
	m:0 d:flex fld:column jc:center
	ai:center h:100vh

global css input
	ff: 'Open Sans', sans-serif;
	w:90% c:black m:10px ta:center bg:warmer2
	border-style:none
	fs:30px
	bg:none tt:uppercase color:black

global css h1
	fs:30px

global css input::placeholder
	c:black

global css h1, h2, p m:0

let value = 100

tag App
	def round_weight weight
		Math.round(weight / 2.5) * 2.5
	
	def get_adjusted_one_rep_max
		value * 0.9

	def get_weight percentage
		let result = round_weight ((get_adjusted_one_rep_max! * percentage) - 45) / 2
		if result > 0
			result
		else
			0

	def render_cell percentage, reps
		<div[d:flex fld:column jc:center ai:center fl:1]>
			<p> percentage
			<div>
				<h1> get_weight percentage
				<p> reps

	def render
		<self[d:flex fld:column flex:1 width:100% jc:center ai:center max-width:400px]>
			css .container d:flex fld:column flex:1 w:100%
			css .container h1 ta:center
			css .container div d:flex fld:row jc:space-between ai:center
			css .row d:flex fld:column jc:center ai:flex-end flex:1
			<input placeholder="1RM" bind=value>
			<input placeholder="Workout Name">
			<input placeholder=Date().split(" ").slice(0,4).join(" ")>
			<div.container>
				<div.row>
					<div[d:flex fld:column jc:center ai:center fl:1]>
						<p> "1RM"
						<h2> value
					<div[d:flex fld:column jc:center ai:center fl:1]>
						<p> "90%"
						<h1> round_weight get_adjusted_one_rep_max!
				<h1> "Warm Up"
				<div.row>
					render_cell 0.4, "x5"
					render_cell 0.5, "x5"
					render_cell 0.6, "x3"
				<h1> "Workout"
				<div.row>
					render_cell 0.65, "x5"
					render_cell 0.75, "x5"
					render_cell 0.85, "x5+"
				<div.row>
					render_cell 0.7, "x3"
					render_cell 0.8, "x3"
					render_cell 0.9, "x3+"
				<div.row>
					render_cell 0.75, "x5"
					render_cell 0.85, "x3"
					render_cell 0.95, "x1+"

imba.mount <App>
