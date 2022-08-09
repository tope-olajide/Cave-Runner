import {
  Scene, DirectionalLight, AmbientLight, Object3D, AnimationMixer, AnimationAction, Clock,
} from 'three';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import allCharacters from '../allCharacters';

import { IallGameCharacters } from '../types';

export default class CharacterSelectionScene extends Scene {
  private fbxLoader = new FBXLoader();

  private woodenCave = new Object3D();

  private allGameCharacters: IallGameCharacters[] = [];

  private animationMixer!: AnimationMixer;

  private dancingAnimation!: AnimationAction;

  private delta = 0;

  private clock = new Clock();

  private xbot = new Object3D();

  private jolleen = new Object3D();

  private peasantGirl = new Object3D();

  private xbotAnimation!: Object3D;

  private jolleenAnimation!: Object3D;

  private peasantGirlAnimation!: Object3D;

  private charactersContainer: Object3D[] = [];

  private animationsContainer: Object3D[] = [];

  private activeCharacter = new Object3D();

  private activeCharacterAnimation!: Object3D;

  private activeIndexNumber = 0;

  async load() {
    this.woodenCave = await this.fbxLoader.loadAsync('./assets/models/wooden-cave.fbx');
    this.woodenCave.position.set(0, 0, -500);
    this.woodenCave.scale.set(0.055, 0.055, 0.055);
    this.add(this.woodenCave);

    const ambient = new AmbientLight(0xFFFFFF, 2.5);
    this.add(ambient);

    const light = new DirectionalLight(0xFFFFFF, 2.5);

    light.position.set(0, 40, -10);
    this.add(light);

    if (!JSON.parse(localStorage.getItem('allGameCharacters') !)) {
      localStorage.setItem('allGameCharacters', JSON.stringify(allCharacters));
    }

    this.allGameCharacters = (JSON.parse(localStorage.getItem('allGameCharacters') !));

    this.xbot = await this.fbxLoader.loadAsync(this.allGameCharacters[0].model);
    this.jolleen = await this.fbxLoader.loadAsync(this.allGameCharacters[1].model);
    this.peasantGirl = await this.fbxLoader.loadAsync(this.allGameCharacters[2].model);

    this.xbotAnimation = await this.fbxLoader.loadAsync(this.allGameCharacters[0].danceAnimation);
    this.jolleenAnimation = await this.fbxLoader.loadAsync(this.allGameCharacters[1]
      .danceAnimation);
    this.peasantGirlAnimation = await this.fbxLoader.loadAsync(this.allGameCharacters[2]
      .danceAnimation);

    this.xbot.visible = false;
    this.jolleen.visible = false;
    this.peasantGirl.visible = false;

    this.add(this.xbot);
    this.add(this.jolleen);
    this.add(this.peasantGirl);

    this.charactersContainer.push(this.xbot, this.jolleen, this.peasantGirl);
    this.animationsContainer.push(
      this.xbotAnimation,
      this.jolleenAnimation,
      this.peasantGirlAnimation,
    );

    this.hide();
  }

  private nextCharacter() {
    if (this.activeIndexNumber + 1 !== this.allGameCharacters.length) {
      this.activeCharacter.visible = false;
      this.activeIndexNumber += 1;
      this.activeCharacter = this.charactersContainer[this.activeIndexNumber];
      this.activeCharacterAnimation = this.animationsContainer[this.activeIndexNumber];
      this.activeCharacter.scale.set(0.1, 0.1, 0.1);
      this.activeCharacter.position.set(0, -35, -110);
      this.activeCharacter.visible = true;
      this.animationMixer = new AnimationMixer(this.activeCharacter);
      this.dancingAnimation = this.animationMixer
        .clipAction(this.activeCharacterAnimation.animations[0]);
      this.dancingAnimation.play();
      (document.querySelector('.character-name') as HTMLInputElement).innerHTML = this.allGameCharacters[this.activeIndexNumber].name;
    }
  }

  private prevCharacter() {
    if (this.activeIndexNumber !== 0) {
      this.activeCharacter.visible = false;
      this.activeIndexNumber -= 1;
      this.activeCharacter = this.charactersContainer[this.activeIndexNumber];
      this.activeCharacterAnimation = this.animationsContainer[this.activeIndexNumber];
      this.activeCharacter.scale.set(0.1, 0.1, 0.1);
      this.activeCharacter.position.set(0, -35, -110);
      this.activeCharacter.visible = true;
      this.animationMixer = new AnimationMixer(this.activeCharacter);
      this.dancingAnimation = this.animationMixer
        .clipAction(this.activeCharacterAnimation.animations[0]);
      this.dancingAnimation.play();
      (document.querySelector('.character-name') as HTMLInputElement).innerHTML = this.allGameCharacters[this.activeIndexNumber].name;
    }
  }

  activateCharacter() {
    const savedPlayerData:IallGameCharacters[] = JSON.parse(localStorage.getItem('allGameCharacters')!);
    const updatedPlayerData = savedPlayerData.map((playerInfo, index: number) => {
      if (this.activeIndexNumber === index) {
        return {
          ...playerInfo, isActive: true, price: 0, isLocked: false,
        };
      }
      return { ...playerInfo, isActive: false };
    });
    localStorage.setItem('allGameCharacters', JSON.stringify(updatedPlayerData));
    this.allGameCharacters = updatedPlayerData;
  }

  purchaseCharacter() {
    const savedPlayerData = JSON.parse(localStorage.getItem('allGameCharacters')!);
    const totalCoins = Number(localStorage.getItem('total-coins'));
    if (totalCoins >= this.allGameCharacters[this.activeIndexNumber].price) {
      const remainingCoins = totalCoins - Number(this.allGameCharacters[this.activeIndexNumber]
        .price);
      localStorage.setItem('total-coins', remainingCoins.toString()!);
      savedPlayerData[this.activeIndexNumber].isLocked = false;
      savedPlayerData[this.activeIndexNumber].price = 0;
      this.activateCharacter();
      (document.querySelector('.total-coins') as HTMLInputElement).innerHTML = `${remainingCoins}`;
    }
  }

  initialize() {
    this.activeCharacter = this.charactersContainer[this.activeIndexNumber];
    this.activeCharacterAnimation = this.animationsContainer[this.activeIndexNumber];
    this.activeCharacter.scale.set(0.1, 0.1, 0.1);
    this.activeCharacter.position.set(0, -35, -110);
    this.activeCharacter.visible = true;
    this.animationMixer = new AnimationMixer(this.activeCharacter);
    this.dancingAnimation = this.animationMixer
      .clipAction(this.activeCharacterAnimation.animations[0]);
    this.dancingAnimation.play();

    (document.querySelector('.total-coins-container') as HTMLInputElement).style.display = 'block';
    (document.querySelector('#character-selection-container') as HTMLInputElement).style.display = 'block';
    (document.querySelector('.home-menu') as HTMLInputElement).style.display = 'block';
    (document.querySelector('.character-name') as HTMLInputElement).innerHTML = this.allGameCharacters[this.activeIndexNumber].name;
    if (!this.visible) {
      this.visible = true;
    }

    if (!this.clock.running) {
      this.clock.start();
    }
    (document.getElementById('next-btn') as HTMLInputElement).onclick = () => {
      this.nextCharacter();
    };

    (document.getElementById('prev-btn') as HTMLInputElement).onclick = () => {
      this.prevCharacter();
    };

    (document.getElementById('character-price-button') as HTMLInputElement).onclick = () => {
      this.purchaseCharacter();
    };

    (document.getElementById('select-character-btn') as HTMLInputElement).onclick = () => {
      this.activateCharacter();
    };

  }

  update() {
    if (this.animationMixer) {
      this.delta = this.clock.getDelta();
      this.animationMixer.update(this.delta);
    }

    

    if (this.allGameCharacters[this.activeIndexNumber].isLocked) {
      (document.getElementById('select-character-btn') as HTMLInputElement).style.display = 'none';
      (document.getElementById('character-price-button') as HTMLInputElement).style.display = 'block';
      (document.getElementById('character-price-text') as HTMLInputElement).innerHTML = `${this.allGameCharacters[this.activeIndexNumber].price}`;
    }

    if (this.allGameCharacters[this.activeIndexNumber].isActive) {
      (document.getElementById('select-character-btn') as HTMLInputElement).style.display = 'block';
      (document.getElementById('character-price-button') as HTMLInputElement).style.display = 'none';
      (document.getElementById('select-button-text') as HTMLInputElement).innerHTML = 'Selected';
    }

    if (!this.allGameCharacters[this.activeIndexNumber]
      .isLocked && !this.allGameCharacters[this.activeIndexNumber].isActive) {
      (document.getElementById('select-character-btn') as HTMLInputElement).style.display = 'block';
      (document.getElementById('character-price-button') as HTMLInputElement).style.display = 'none';
      (document.getElementById('select-button-text') as HTMLInputElement).innerText = 'Select';
    }
  }

  hide() {
    this.visible = false;
    (document.querySelector('#character-selection-container') as HTMLInputElement).style.display = 'none';
    (document.querySelector('.home-menu') as HTMLInputElement).style.display = 'none';
    (document.querySelector('.total-coins-container') as HTMLInputElement).style.display = 'none';
    this.clock.stop();
  }
}
