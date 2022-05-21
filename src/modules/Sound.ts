import {
  musicClick,
  musicDrop,
  musicEliminate,
  musicMatch,
  musicSwap
} from '../config/index'

class Sound {
  audio: HTMLAudioElement = new Audio()
  eliminateAudio: HTMLAudioElement = new Audio()
  matchAudio: HTMLAudioElement = new Audio()
  bgAudio: HTMLAudioElement = new Audio()
  src: string = ''

  constructor() {}

  play(src: string) {
    this.audio.src = src
    let playPromise = this.audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then((_) => {
          this.audio.play()
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  match(count: number) {
    if (count < 3) {
      return
    } else if (count > 11) {
      count = 11
    } else {
      count = count % 2 === 0 ? count - 1 : count
    }

    this.matchAudio.src = musicMatch[count]
    const promise = this.matchAudio.play()
    promise
      .then(() => {
        this.matchAudio.play()
      })
      .catch((error) => console.log(error))
  }

  eliminate(count: number) {
    if (count > 8) {
      count = 8
    }
    this.eliminateAudio.src = musicEliminate[count]
    const promise = this.eliminateAudio.play()
    promise
      .then(() => {
        this.eliminateAudio.play()
      })
      .catch((error) => console.log(error))
  }

  click() {
    this.play(musicClick)
  }

  drop() {
    this.play(musicDrop)
  }

  swap() {
    this.play(musicSwap)
  }
}
export default Sound
