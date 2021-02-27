'use strict'

class Bj {
  constructor () {
    this.elements = {
      stickman: document.querySelector('.stickman-cards'),
      player: document.querySelector('.player-cards'),
      btnMore: document.querySelector('.more'),
      btnStop: document.querySelector('.stop'),
      stickmanScore: document.querySelector('.stikman-score'),
      playerScore: document.querySelector('.player-score'),
      modal: document.querySelector('.modal-results'),
    }
  }
  cards = {
    stickman: [],
    player: [],
  }
  score = {
    stickman: 0,
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
          <td>stickman</td>
          <td>you</td>
        </tr>
        <tr>
          <td>${this.score.stickman}</td>
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
  getStickmanScore() {
    this.score.stickman = 0
    let cardIndexes = []
    this.cards.stickman.forEach(card => cardIndexes.push(card.index))
    cardIndexes.sort((a, b) => a-b)

    cardIndexes.forEach((index, id) => {
      if (index < 11) this.score.stickman += index
      else if (index < 14) this.score.stickman += 10
      else if (index === 14) {
        if (id === cardIndexes.length-1) {
          this.score.stickman+11 > 21 
          ? this.score.stickman += 1
          : this.score.stickman += 11
        } else {
          this.score.stickman+11 >= 21 
            ? this.score.stickman += 1
            : this.score.stickman += 11
        }
      }
    })
    
    this.elements.stickmanScore.innerHTML = this.score.stickman
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
  renderStickmanCards() {
    let elemId = []
    this.elements.stickman.childNodes.forEach( el => elemId.push(+el.dataset.id) )

    this.cards.stickman.forEach(card => {
      if (elemId.indexOf(card.id) === -1) {
        this.elements.stickman.appendChild(
          this.createCard(card, true)
        )  
      }
    })

    this.getStickmanScore()
  }
  getCardsStickman() {
    let stScore = this.score.stickman,
        plScore = this.score.player

    if (stScore < 17 && stScore < plScore) {
      this.cards.stickman.push(this.getRandomCard())
      setTimeout(() => {
        this.renderStickmanCards()
        stScore < 17 && stScore < plScore ? this.getCardsStickman(): ''
        return
      }, 700)
    } else if (stScore === plScore) this.renderModal('standoff 👉👈')
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
      this.cards.stickman.map(card => card.isFlipped = false)
      if (this.elements.stickman.querySelector('.flipped')) {
        this.elements.stickman.querySelector('.flipped').classList.add('wasflipped')
        this.elements.stickman.querySelector('.flipped').classList.remove('flipped')
      }

      
      setTimeout(() => {
        this.getStickmanScore()
        this.getCardsStickman()
      }, 500);
      this.elements.btnMore.setAttribute('disabled', true)
    })

    document.addEventListener('click', e => {
      if (e.target.classList.contains('restart')) {
        this.elements.modal.classList.add('hidden')

        this.cards.stickman = []
        this.cards.player = []

        this.elements.player.innerHTML = ''
        this.elements.stickman.innerHTML = ''
        
        this.elements.btnMore.removeAttribute('disabled')
        this.elements.btnStop.removeAttribute('disabled')

        this.cards.stickman.push(this.getRandomCard(false), this.getRandomCard(true))
        this.cards.player.push(this.getRandomCard(), this.getRandomCard())
        this.renderStickmanCards()
        this.renderPlayersCards()
      }
    })
  }
  init() {
    this.addHandlers()
    this.cards.stickman.push(this.getRandomCard(false), this.getRandomCard(true))
    this.cards.player.push(this.getRandomCard(), this.getRandomCard())
    this.renderStickmanCards()
    this.renderPlayersCards()
  }
}



let game = new Bj()
game.init()