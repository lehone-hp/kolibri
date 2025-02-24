<template>

  <div class="k-filter">
    <UiIcon
      class="k-filter-icon"
      :style="{ color: $themeTokens.annotation }"
      :ariaLabel="$tr('filter')"
    >
      <KIcon icon="search" />
    </UiIcon>

    <input
      ref="searchinput"
      v-model.trim="model"
      type="search"
      :class="['k-filter-input', $computedClass(kFilterPlaceHolderStyle)]"
      :style="{
        color: $themeTokens.text,
        border: `2px solid ${$themeTokens.fineLine}`,
      }"
      :placeholder="placeholder"
      :aria-label="placeholder"
      :autofocus="autofocus"
      @keyup="throttledEmitInput($event.target.value)"
    >

    <KIconButton
      size="small"
      class="k-filter-clear-button"
      icon="clear"
      :class="model === '' ? '' : 'k-filter-clear-button-visible'"
      :ariaLabel="$tr('clear')"
      @click="handleClickClear"
    />
  </div>

</template>


<script>

  import throttle from 'lodash/throttle';
  import UiIcon from 'kolibri-design-system/lib/keen/UiIcon';
  /**
   * Used to filter items via text input
   */
  export default {
    name: 'FilterTextbox',
    components: {
      UiIcon,
    },
    props: {
      /**
       * v-model
       */
      value: {
        type: String,
        default: null,
      },
      /**
       * Placeholder
       */
      placeholder: {
        type: String,
        required: true,
      },
      /**
       * Whether to autofocus
       */
      autofocus: {
        type: Boolean,
        default: false,
      },
      // If provided, will throttle and use the prop as the delay value in msecs
      throttleInput: {
        type: Number,
        required: false,
        default: 15,
      },
    },
    computed: {
      throttledEmitInput() {
        return throttle(val => {
          // This will also be triggered on keyUp for Android
          // where the keyboard may not trigger a `model.set` call
          // and thereby not triggering this
          if (val !== this.value) {
            this.$emit('input', val);
          }
        }, this.throttleInput);
      },
      model: {
        get() {
          return this.value;
        },
        set(val) {
          /**
           * Emits input event with new value
           */
          if (this.throttleInput) {
            this.throttledEmitInput(val);
          } else {
            this.$emit('input', val);
          }
        },
      },
      kFilterPlaceHolderStyle() {
        return {
          '::placeholder': {
            color: this.$themeTokens.annotation,
          },
        };
      },
    },
    methods: {
      handleClickClear() {
        this.model = '';
        this.$refs.searchinput.focus();
      },
    },
    $trs: {
      filter: {
        message: 'filter',
        context:
          'The filter functionality allows users to find elements in Kolibri more efficiently. For example, in a list of users the filter can be used to view users by permissions, user type or facility.',
      },
      clear: {
        message: 'clear',
        context:
          'Clear in this context means clear or remove any previous filter parameters from the filter option.',
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri-design-system/lib/styles/definitions';

  .k-filter {
    position: relative;
    display: inline-block;
    width: 540px;
    max-width: 100%;
  }

  .k-filter-icon {
    position: absolute;
    top: 6px;
    left: 0;
    margin-right: 8px;
    margin-left: 8px;
    font-size: 24px;
  }

  .k-filter-input {
    width: calc(100% - 80px);
    height: 40px;
    padding-top: 0;
    padding-right: 40px;
    padding-bottom: 0;
    padding-left: 40px;
    margin: 0;
    font-size: 14px;
    border-radius: $radius;
  }

  .k-filter-clear-button {
    position: absolute;
    top: 6px;
    right: 0;
    width: 24px;
    height: 24px;
    margin-right: 8px;
    margin-left: 8px;
    visibility: hidden;
  }

  .k-filter-clear-button-visible {
    visibility: visible;
  }

</style>
