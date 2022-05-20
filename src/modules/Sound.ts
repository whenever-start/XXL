class Sound {
  matchCount: number = 0
  audio: HTMLAudioElement = new Audio()
  bgAudio: HTMLAudioElement = new Audio()
  src: string = ''
  musicSound: { [count: number]: string } = {}

  constructor() {}

  play(src: string) {
    this.audio.src = src
    this.audio.play()
  }

  match(count: number) {
    this.play(this.musicSound[count])
  }
}
export default Sound
