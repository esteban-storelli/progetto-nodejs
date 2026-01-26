class Article {
	constructor(title, body) {
		this.title = title;
		this.body = body;
		this.word_count = this.calculateWordCount();
		this.first_paragraph = this.getFirstParagraph();
	}

	calculateWordCount() {
        // Separa tutti i char vuoti (spazio, tab, newline)
		return this.body.split(/\s+/).length;
	}

	getFirstParagraph() {
		const words = this.body.split(/\s+/);
		return words.slice(0, 50).join(" ");
	}

	toString() {
		return `Article(title=${JSON.stringify(this.title)}, word_count=${this.word_count})`;
	}
}

module.exports = Article;
