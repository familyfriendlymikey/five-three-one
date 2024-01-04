global css
	@root ff:Open Sans, system-ui
	body d:vcc 1fs:20px 1g:2px fs:10px
	input
		::-webkit-outer-spin-button, ::-webkit-inner-spin-button -webkit-appearance:none m:0
		ff:Open Sans, system-ui
		w:90% c:black d:hcc ta:center bg:warmer2 border-style:none
		fs:1fs bg:none tt:cap color:black
		@placeholder c:black

tag app

	bar = 45
	weight = 50
	reps = 1
	lcd = 2.5

	get render? do mounted?

	def mount
		try {bar,weight,reps,lcd} = imba.locals.data
		render!

	def save
		imba.locals.data = {bar,weight,reps,lcd}

	get orm
		let total-weight = ((weight * 2) + bar)
		let estimate =
			if reps <= 1
				total-weight
			else
				total-weight * (1 + (0.0333 * reps))
		estimate

	get tm
		orm * .9

	def round-weight weight
		Math.round(weight / lcd) * lcd

	def to-plate weight
		Math.max 0, round-weight((weight - bar) / 2)

	def cell percentage, reps
		<div>
			css d:vcc fl:1
			<div> percentage
			<div>
				<div>
					css fs:1fs
					to-plate tm * percentage
				<div>
					css fs:12px
					reps

	<self>
		css d:vcc fl:1 maw:400px p:1g g:1g
			w:90% h:90vh

		<input placeholder="Workout Name">
		<input placeholder=Date!.split(" ").slice(0,4).join(" ")>

		<div>
			css d:vcc g:1g
				%row d:hcc g:1g
				%col d:vcc
				%title tt:cap
			<%row>
				<%col>
					<%title> "bar weight:"
					<input @input=save type="number" placeholder="bar weight" bind=bar>
				<%col>
					<%title> "lowest weight:"
					<input @input=save type="number" placeholder="lowest weight" bind=lcd>
			<%row>
				<%col>
					<%title> "max weight:"
					<input @input=save type="number" placeholder="Max Weight" bind=weight>
				<%col>
					<%title> "max reps:"
					<input @input=save type="number" placeholder="Max Reps" bind=reps>

		<.container>
			css d:vtc fl:1 w:100% g:1g
				%title d:hcc fs:1fs tt:cap
				.row d:hcs w:100%

			<%title> "warm up"
			<.row>
				cell 0.4, "x5"
				cell 0.5, "x5"
				cell 0.6, "x3"

			<%title> "week 1"
			<.row>
				cell 0.65, "x5"
				cell 0.75, "x5"
				cell 0.85, "x5+"

			<%title> "week 2"
			<.row>
				cell 0.7, "x3"
				cell 0.8, "x3"
				cell 0.9, "x3+"

			<%title> "week 3"
			<.row>
				cell 0.75, "x5"
				cell 0.85, "x3"
				cell 0.95, "x1+"

			<%title> "week 4"
			<.row>
				cell 0.4, "x5"
				cell 0.5, "x5"
				cell 0.6, "x5"

			<%title> "info"
			<div>
				css d:hcs w:100%

				<div>
					<div> "1RM: {orm.toFixed(2)}"
					<div> "1RM plate: {to-plate(orm)}"

				<div>
					<div> "TM: {tm.toFixed(2)}"
					<div> "TM plate: {to-plate(tm)}"

				<div>
					<div> "PR: {(tm * .95).toFixed(2)}"
					<div> "PR plate: {to-plate(tm * .95)}"

imba.mount <app>
