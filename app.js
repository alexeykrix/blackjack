'use strict'

class Bj {
  constructor () {
    this.elements = {
      croupier: document.querySelector('.croupier-cards'),
      player: document.querySelector('.player-cards'),
      btnMore: document.querySelector('.more'),
      btnStop: document.querySelector('.stop'),
      croupierScore: document.querySelector('.stikman-score'),
      playerScore: document.querySelector('.player-score'),
      modal: document.querySelector('.modal-results'),
    }
  }
  cards = {
    croupier: [],
    player: [],
  }
  score = {
    croupier: 0,
    player: 0,
  }
  suits = ['c', 'h', 's', 'd']
  indexes = [2,3,4,5,6,7,8,9,10,11,12,13,14]

  createCard({suit, index, id, isFlipped}, canFlip) {
    let template = `
      <div class="front"></div>
      ${canFlip? '<div class="back">':''}
    `
    let el = document.createElement('div')
    el.classList = `card ${suit} _${index} ${isFlipped? 'flipped':''}`
    el.dataset.id = id
    el.innerHTML = template
    return el
  }

  renderModal(msg) {
    let template = `
      <p class="result">${msg}</p>
      <table>
        <tr>
          <td>croupier</td>
          <td>you</td>
        </tr>
        <tr>
          <td>${this.score.croupier}</td>
          <td>${this.score.player}</td>
        </tr>
      </table>
      <button class="restart">restart</button>
    `

    this.elements.btnMore.setAttribute('disabled', true)
    this.elements.btnStop.setAttribute('disabled', true)

    this.elements.modal.innerHTML = template
    this.elements.modal.classList.remove('hidden')
  }

  getRandom(length) {
    return Math.floor(Math.random() * (length + 1))
  }

  getRandomCard(isFlipped) {
    return {
      suit: this.suits[this.getRandom(this.suits.length-1)],
      index: this.indexes[this.getRandom(this.indexes.length-1)],
      id: +Date.now() + this.getRandom(9),
      isFlipped: isFlipped,
    }
  }
  getCroupierScore() {
    this.score.croupier = 0
    let cardIndexes = []
    this.cards.croupier.forEach(card => card.isFlipped? '': cardIndexes.push(card.index))
    cardIndexes.sort((a, b) => a-b)

    cardIndexes.forEach((index, id) => {
      if (index < 11) this.score.croupier += index
      else if (index < 14) this.score.croupier += 10
      else if (index === 14) {
        if (id === cardIndexes.length-1) {
          this.score.croupier+11 > 21 
          ? this.score.croupier += 1
          : this.score.croupier += 11
        } else {
          this.score.croupier+11 >= 21 
            ? this.score.croupier += 1
            : this.score.croupier += 11
        }
      }
    })
    
    this.elements.croupierScore.innerHTML = this.score.croupier
  }
  getPlayerScore() {
    this.score.player = 0
    let cardIndexes = []
    this.cards.player.forEach(card => cardIndexes.push(card.index))
    cardIndexes.sort((a, b) => a-b)

    cardIndexes.forEach((index, id) => {
      if (index < 11) this.score.player += index
      else if (index < 14) this.score.player += 10
      else if (index === 14) {
        if (id === cardIndexes.length-1) {
          this.score.player+11 > 21 
          ? this.score.player += 1
          : this.score.player += 11
        } else {
          this.score.player+11 >= 21 
            ? this.score.player += 1
            : this.score.player += 11
        }
      }
    })

    this.elements.playerScore.innerHTML = this.score.player
  }
  renderPlayersCards() {
    let elemId = []
    this.elements.player.childNodes.forEach( el => elemId.push(+el.dataset.id) )

    this.cards.player.forEach(card => {
      if (elemId.indexOf(card.id) === -1) {
        this.elements.player.appendChild(
          this.createCard(card, false)
        )  
      }
    })

    this.getPlayerScore()
  }
  renderCroupierCards() {
    let elemId = []
    this.elements.croupier.childNodes.forEach( el => elemId.push(+el.dataset.id) )

    this.cards.croupier.forEach(card => {
      if (elemId.indexOf(card.id) === -1) {
        this.elements.croupier.appendChild(
          this.createCard(card, true)
        )  
      }
    })

    this.getCroupierScore()
  }
  getCardsCroupier() {
    let stScore = this.score.croupier,
        plScore = this.score.player

    if (stScore < 17 && stScore < plScore) {
      this.cards.croupier.push(this.getRandomCard())
      setTimeout(() => {
        this.renderCroupierCards()
        stScore < 17 && stScore < plScore ? this.getCardsCroupier(): ''
        return
      }, 700)
    } else if (stScore === plScore) this.renderModal('Dead heat 👉👈')
    else if ((stScore > plScore && stScore <= 21) 
      || stScore === 21) this.renderModal('You lose 😞')
    else this.renderModal('You win 😀')
  }
  addHandlers() {
    this.elements.btnMore.addEventListener('click', () => { // more
      this.cards.player.push(this.getRandomCard())
      this.renderPlayersCards()
      if (this.score.player >= 21) {
        this.score.player === 21? this.renderModal('Blackjack 😆'): ''
        this.score.player > 21? this.renderModal('You lose 😞'): ''
      }
    })

    this.elements.btnStop.addEventListener('click', () => { // stop
      this.cards.croupier.map(card => card.isFlipped = false)
      if (this.elements.croupier.querySelector('.flipped')) {
        this.elements.croupier.querySelector('.flipped').classList.add('wasflipped')
        this.elements.croupier.querySelector('.flipped').classList.remove('flipped')
      }

      
      setTimeout(() => {
        this.getCroupierScore()
        this.getCardsCroupier()
      }, 500);
      this.elements.btnMore.setAttribute('disabled', true)
    })

    document.addEventListener('click', e => {
      if (e.target.classList.contains('restart')) {
        this.elements.modal.classList.add('hidden')

        this.cards.croupier = []
        this.cards.player = []

        this.elements.player.innerHTML = ''
        this.elements.croupier.innerHTML = ''
        
        this.elements.btnMore.removeAttribute('disabled')
        this.elements.btnStop.removeAttribute('disabled')

        this.cards.croupier.push(this.getRandomCard(false), this.getRandomCard(true))
        this.cards.player.push(this.getRandomCard(), this.getRandomCard())
        this.renderCroupierCards()
        this.renderPlayersCards()
      }
    })
  }
  init() {
    this.addHandlers()
    this.cards.croupier.push(this.getRandomCard(false), this.getRandomCard(true))
    this.cards.player.push(this.getRandomCard(), this.getRandomCard())
    this.renderCroupierCards()
    this.renderPlayersCards()
  }
}



let game = new Bj()
game.init()