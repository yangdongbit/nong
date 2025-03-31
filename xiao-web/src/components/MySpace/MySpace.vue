<template>
  <div class="box">
    <header>
      <div class="container">
        <div class="header-content">
          <h1>我的农乐购</h1>
          <div class="logo">
            <img src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="" />
          </div>
        </div>
      </div>
    </header>

    <div class="container">
      <main>
        <aside>
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">用户信息</h2>
            </div>
            <div class="card-content">
              <div
                style="display: flex; align-items: center; margin-bottom: 1rem"
              >
                <div
                  class="avatar"
                  style="
                    margin-right: 1rem;
                    width: 50px;
                    height: 50px;
                    text-align: center;
                    line-height: 50px;
                    cursor: pointer;
                  "
                  @click="triggerFileInput"
                >
                  <img
                    v-if="avatarUrl"
                    :src="`http://127.0.0.1:3000${avatarUrl}`"
                    alt="用户头像"
                    class="avatar-img"
                    style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                  />
                  <span v-else>+</span>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  style="display: none"
                  accept="image/*"
                  @change="handleFileChange"
                />
                <div>
                  <h3>{{ loginStore.Loginuser.name }}</h3>
                  <p>会员等级</p>
                </div>
              </div>
              <a
                href="#"
                class="btn btn-outline"
                style="display: block; margin-bottom: 0.5rem"
                @click="openAddressModal"
                >收货地址</a
              >
              <a
                href="#"
                class="btn btn-outline"
                style="display: block"
                @click="openModal"
                >账号设置</a
              >
            </div>
          </div>
        </aside>

        <div class="main-content">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">我的资产</h2>
            </div>
            <div class="card-content">
              <div class="grid grid-3 text-center">
                <div>
                  <p style="font-size: 1.5rem">0 张</p>
                  <p>优惠券</p>
                </div>
                <div>
                  <p style="font-size: 1.5rem; color: #8acd58">{{ UserHub.UserHub[0]?.balance }}</p>
                  <p>农乐币</p>
                </div>
                <div>
                  <a
                    href="#"
                    class="btn btn-outline"
                    @click.prevent="showMoreAssets"
                    >查看更多</a
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2 class="card-title">我的订单</h2>
            </div>
            <div class="card-content">
              <div class="grid grid-5 text-center">
                <div @click="showUnpaidOrders" style="cursor: pointer">
                  <div style="font-size: 2rem">💳</div>
                  <p>待付款</p>
                </div>
                <div @click="showPendingShipOrders" style="cursor: pointer">
                  <div style="font-size: 2rem">📦</div>
                  <p>待发货</p>
                </div>
                <div @click="showShippingOrders" style="cursor: pointer">
                  <div style="font-size: 2rem">🚚</div>
                  <p>待收货</p>
                </div>
                <div @click="showPendingReviews" style="cursor: pointer">
                  <div style="font-size: 2rem">💬</div>
                  <p>待评价</p>
                </div>
                <div @click="showRefundService" style="cursor: pointer">
                  <div style="font-size: 2rem">🔄</div>
                  <p>退款/售后</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2 class="card-title">快捷功能</h2>
            </div>
            <div class="card-content">
              <div class="quick-functions">
                <div
                  class="quick-function-item"
                  @click.prevent="showExpressDelivery"
                >
                  <div class="icon-wrapper">
                    <i class="quick-icon">📦</i>
                  </div>
                  <span class="quick-label">我的快递</span>
                </div>
                <div class="quick-function-item">
                  <div class="icon-wrapper">
                    <i class="quick-icon">❤️</i>
                  </div>
                  <span class="quick-label">我的收藏</span>
                </div>
                <div class="quick-function-item">
                  <div class="icon-wrapper">
                    <i class="quick-icon">👣</i>
                  </div>
                  <span class="quick-label">我的足迹</span>
                </div>
                <div
                  class="quick-function-item"
                  @click.prevent="showPickupCode"
                >
                  <div class="icon-wrapper">
                    <i class="quick-icon">🔒</i>
                  </div>
                  <span class="quick-label">查取件</span>
                </div>
                <div class="quick-function-item">
                  <div class="icon-wrapper">
                    <i class="quick-icon">📅</i>
                  </div>
                  <span class="quick-label">每日签到</span>
                </div>
                <div class="quick-function-item">
                  <div class="icon-wrapper">
                    <i class="quick-icon">✉️</i>
                  </div>
                  <span class="quick-label">查寄件</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div
      class="modal-overlay"
      v-if="showSettingsModal"
      @click.self="closeModal"
    >
      <div class="modal-content">
        <h2>账号设置</h2>
        <div class="form-group">
          <label>用户名</label>
          <input
            type="text"
            v-model="userSettings.name"
            :disabled="!isEditing"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            type="password"
            v-model="userSettings.password"
            :disabled="!isEditing"
          />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input
            type="email"
            v-model="userSettings.email"
            :disabled="!isEditing"
          />
        </div>
        <div class="modal-buttons">
          <button
            class="btn"
            :class="isEditing ? 'btn-primary' : 'btn-outline'"
            @click="toggleEdit"
          >
            {{ isEditing ? "保存" : "修改" }}
          </button>
          <button class="btn btn-outline" @click="closeModal">取消</button>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showAddressModal"
      @click.self="closeAddressModal"
    >
      <div class="modal-content">
        <h2>收货地址</h2>
        <div v-if="!isAddingAddress">
          <div v-if="addresses.length > 0" class="address-list">
            <div
              v-for="(address, index) in addresses"
              :key="index"
              class="address-item"
            >
              <div class="address-info">
                <p>
                  <strong>{{ address.name }}</strong> {{ address.phone }}
                </p>
                <p>
                  {{ address.province }}{{ address.city }}{{ address.district
                  }}{{ address.detail }}
                </p>
              </div>
              <div class="address-actions">
                <button
                  class="btn btn-outline btn-sm"
                  @click="editAddress(index)"
                >
                  编辑
                </button>
                <button
                  class="btn btn-outline btn-sm"
                  @click="deleteAddress(index)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-address">
            <p>暂无收货地址</p>
          </div>
          <button
            class="btn btn-primary"
            style="margin-top: 1rem"
            @click="startAddAddress"
          >
            添加新地址
          </button>
        </div>

        <div v-else class="address-form">
          <div class="form-group">
            <label>收货人</label>
            <input
              type="text"
              v-model="currentAddress.name"
              placeholder="请输入收货人姓名"
            />
          </div>
          <div class="form-group">
            <label>手机号码</label>
            <input
              type="tel"
              v-model="currentAddress.phone"
              placeholder="请输入手机号码"
            />
          </div>
          <div class="form-group">
            <label>所在地区</label>
            <div class="area-select">
              <input
                type="text"
                v-model="currentAddress.province"
                placeholder="省"
              />
              <input
                type="text"
                v-model="currentAddress.city"
                placeholder="市"
              />
              <input
                type="text"
                v-model="currentAddress.district"
                placeholder="区"
              />
            </div>
          </div>
          <div class="form-group">
            <label>详细地址</label>
            <input
              type="text"
              v-model="currentAddress.detail"
              placeholder="街道门牌号等"
            />
          </div>
          <div class="modal-buttons">
            <button class="btn btn-primary" @click="saveAddress">保存</button>
            <button class="btn btn-outline" @click="cancelAddAddress">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showUnpaidModal"
      @click.self="closeUnpaidModal"
    >
      <div class="modal-content">
        <h2>待付款订单</h2>
        <div v-if="unpaidOrders.length > 0" class="unpaid-orders">
          <div
            v-for="(order, index) in unpaidOrders"
            :key="index"
            class="order-item"
          >
            <div class="order-info">
              <div class="order-header">
                <span>订单号：{{ order.orderNumber }}</span>
                <span>{{ order.createTime }}</span>
              </div>
              <div class="product-list">
                <div
                  v-for="(product, pIndex) in order.products"
                  :key="pIndex"
                  class="product-item"
                >
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="product-image"
                  />
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <p class="product-price">¥{{ product.price }}</p>
                    <p class="product-quantity">x{{ product.quantity }}</p>
                  </div>
                </div>
              </div>
              <div class="order-footer">
                <div class="order-total">
                  总计：<span class="price">¥{{ order.totalAmount }}</span>
                </div>
                <div class="order-actions">
                  <button class="btn btn-primary" @click="payOrder(order)">
                    立即付款
                  </button>
                  <button
                    class="btn btn-outline"
                    @click="cancelOrder(order, index)"
                  >
                    取消订单
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-orders">
          <p>无待付款订单</p>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showPendingShipModal"
      @click.self="closePendingShipModal"
    >
      <div class="modal-content">
        <h2>待发货订单</h2>
        <div v-if="pendingShipOrders.length > 0" class="unpaid-orders">
          <div
            v-for="(order, index) in pendingShipOrders"
            :key="index"
            class="order-item"
          >
            <div class="order-info">
              <div class="order-header">
                <span>订单号：{{ order.orderNumber }}</span>
                <span>{{ order.createTime }}</span>
              </div>
              <div class="product-list">
                <div
                  v-for="(product, pIndex) in order.products"
                  :key="pIndex"
                  class="product-item"
                >
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="product-image"
                  />
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <p class="product-price">¥{{ product.price }}</p>
                    <p class="product-quantity">x{{ product.quantity }}</p>
                  </div>
                </div>
              </div>
              <div class="order-footer">
                <div class="shipping-info">
                  <p>收货地址：{{ order.address }}</p>
                  <p>支付时间：{{ order.payTime }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-orders">
          <p>暂无待发货订单</p>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showShippingModal"
      @click.self="closeShippingModal"
    >
      <div class="modal-content">
        <h2>待收货订单</h2>
        <div v-if="shippingOrders.length > 0" class="unpaid-orders">
          <div
            v-for="(order, index) in shippingOrders"
            :key="index"
            class="order-item"
          >
            <div class="order-info">
              <div class="order-header">
                <span>订单号：{{ order.orderNumber }}</span>
                <span>{{ order.createTime }}</span>
              </div>
              <div class="product-list">
                <div
                  v-for="(product, pIndex) in order.products"
                  :key="pIndex"
                  class="product-item"
                >
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="product-image"
                  />
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <p class="product-price">¥{{ product.price }}</p>
                    <p class="product-quantity">x{{ product.quantity }}</p>
                  </div>
                </div>
              </div>
              <div class="order-footer">
                <div class="shipping-info">
                  <p>收货地址：{{ order.address }}</p>
                  <p>发货时间：{{ order.shipTime }}</p>
                  <p>物流信息：{{ order.trackingInfo }}</p>
                </div>
                <div class="order-actions">
                  <button
                    class="btn btn-primary"
                    @click="confirmReceive(order, index)"
                  >
                    确收货
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-orders">
          <p>暂无待收货订单</p>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showReviewModal"
      @click.self="closeReviewModal"
    >
      <div class="modal-content">
        <h2>待评价订单</h2>
        <div v-if="pendingReviews.length > 0" class="unpaid-orders">
          <div
            v-for="(order, index) in pendingReviews"
            :key="index"
            class="order-item"
          >
            <div class="order-info">
              <div class="order-header">
                <span>订单号：{{ order.orderNumber }}</span>
                <span>{{ order.createTime }}</span>
              </div>
              <div class="product-list">
                <div
                  v-for="(product, pIndex) in order.products"
                  :key="pIndex"
                  class="product-item"
                >
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="product-image"
                  />
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <p class="product-price">¥{{ product.price }}</p>
                    <p class="product-quantity">x{{ product.quantity }}</p>
                  </div>
                </div>
              </div>
              <div class="review-section">
                <div class="rating">
                  <span>商品评分：</span>
                  <div class="stars">
                    <span
                      v-for="star in 5"
                      :key="star"
                      class="star"
                      :class="{ active: star <= order.rating }"
                      @click="setRating(order, star)"
                    >
                      ⭐
                    </span>
                  </div>
                </div>
                <div class="review-content">
                  <textarea
                    v-model="order.reviewContent"
                    placeholder="请输入您的评价内容..."
                    rows="4"
                  ></textarea>
                </div>
                <div class="order-actions">
                  <button
                    class="btn btn-primary"
                    @click="submitReview(order, index)"
                  >
                    提交评价
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-orders">
          <p>暂无待评价订单</p>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showRefundModal"
      @click.self="closeRefundModal"
    >
      <div class="modal-content">
        <h2>退款/售后服务</h2>
        <div v-if="refundOrders.length > 0" class="unpaid-orders">
          <div
            v-for="(order, index) in refundOrders"
            :key="index"
            class="order-item"
          >
            <div class="order-info">
              <div class="order-header">
                <span>订单号：{{ order.orderNumber }}</span>
                <span>{{ order.createTime }}</span>
              </div>
              <div class="product-list">
                <div
                  v-for="(product, pIndex) in order.products"
                  :key="pIndex"
                  class="product-item"
                >
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="product-image"
                  />
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <p class="product-price">¥{{ product.price }}</p>
                    <p class="product-quantity">x{{ product.quantity }}</p>
                  </div>
                </div>
              </div>
              <div class="refund-section">
                <div class="form-group">
                  <label>服务类型</label>
                  <select v-model="order.serviceType" class="form-select">
                    <option value="">请选择服务类型</option>
                    <option value="refund">仅退款</option>
                    <option value="return">退货退款</option>
                    <option value="exchange">换货</option>
                    <option value="repair">维修</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>申请原因</label>
                  <select v-model="order.reason" class="form-select">
                    <option value="">请选择申请原因</option>
                    <option value="quality">商品质量问题</option>
                    <option value="damage">商品损坏</option>
                    <option value="wrong">商品错误</option>
                    <option value="other">其他原因</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>问题描述</label>
                  <textarea
                    v-model="order.description"
                    placeholder="请详细描述您遇到的问题..."
                    rows="4"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label>上传凭证</label>
                  <input
                    type="file"
                    @change="handleImageUpload($event, order)"
                    accept="image/*"
                    multiple
                    class="form-control"
                  />
                  <div
                    class="image-preview"
                    v-if="order.images && order.images.length"
                  >
                    <img
                      v-for="(img, imgIndex) in order.images"
                      :key="imgIndex"
                      :src="img"
                      class="preview-image"
                      @click="removeImage(order, imgIndex)"
                    />
                  </div>
                </div>
                <div class="order-actions">
                  <button
                    class="btn btn-primary"
                    @click="submitRefund(order, index)"
                  >
                    提交申请
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-orders">
          <p>暂无可申请的订单</p>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showAssetsModal"
      @click.self="closeAssetsModal"
    >
      <div class="modal-content">
        <h2>我的资产详情</h2>
        <div class="assets-details">
          <!-- 优惠券部分 -->
          <div class="asset-section">
            <h3>我的优惠券</h3>
            <div class="coupon-list">
              <div
                v-for="(coupon, index) in coupons"
                :key="'coupon-' + index"
                class="coupon-item"
              >
                <div class="coupon-amount">{{ coupon.discount }}</div>
                <div class="coupon-info">
                  <p class="coupon-name">{{ coupon.name }}</p>
                  <p class="coupon-validity">
                    有效期至：{{ coupon.validUntil }}
                  </p>
                  <p class="coupon-condition">{{ coupon.condition }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 农乐币部分 -->
          <div class="asset-section">
            <h3>我的农乐币</h3>
            <div class="coins-info">
              <div class="coins-balance">
                <p class="coins-amount">{{ UserHub.UserHub[0].balance }}</p>
                <p class="coins-label">当前农乐币</p>
              </div>
              <div class="coins-details">
                <h4>农乐币使用规则：</h4>
                <ul>
                  <li>1农乐币 = 1元</li>
                  <li>可用于商品抵扣</li>
                </ul>
                <div class="coins-actions">
                  <button class="btn btn-outline" @click="showCoinsHistory">
                    查看明细
                  </button>
                  <button class="btn btn-primary" @click="exchangeCoins">
                    立即兑换
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showPickupModal"
      @click.self="closePickupModal"
    >
      <div class="modal-content">
        <h2>查取件码</h2>
        <div class="pickup-search">
          <div class="form-group">
            <input
              type="text"
              v-model="pickupOrderNumber"
              placeholder="请输入订单号"
              class="search-input"
            />
            <button class="btn btn-primary" @click="searchPickupCode">
              查询
            </button>
          </div>
        </div>

        <div v-if="pickupOrders.length > 0" class="pickup-list">
          <div
            v-for="(order, index) in pickupOrders"
            :key="index"
            class="pickup-item"
          >
            <div class="pickup-info">
              <div class="order-header">
                <span>订单号：{{ order.orderNumber }}</span>
                <span>{{ order.createTime }}</span>
              </div>
              <div class="pickup-code">
                <h3>取件码</h3>
                <div class="code-display">{{ order.pickupCode }}</div>
              </div>
              <div class="pickup-details">
                <p><strong>收货地址：</strong>{{ order.pickupAddress }}</p>
                <p><strong>快递公司：</strong>{{ order.courier }}</p>
                <p><strong>有效期至：</strong>{{ order.validUntil }}</p>
              </div>
              <div class="pickup-actions">
                <button
                  class="btn btn-primary"
                  @click="copyCode(order.pickupCode)"
                >
                  复制取件码
                </button>
                <button class="btn btn-outline" @click="showQRCode(order)">
                  查看二维码
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="hasSearched" class="empty-pickup">
          <p>未找到相关取件信息</p>
        </div>
      </div>
    </div>

    <div
      class="modal-overlay"
      v-if="showExpressModal"
      @click.self="closeExpressModal"
    >
      <div class="modal-content">
        <h2>我的快递</h2>
        <div class="express-filter">
          <select v-model="expressStatus" class="form-select">
            <option value="all">全部快递</option>
            <option value="shipping">运输中</option>
            <option value="delivered">已送达</option>
            <option value="received">已签收</option>
          </select>
        </div>

        <div v-if="filteredExpress.length > 0" class="express-list">
          <div
            v-for="(express, index) in filteredExpress"
            :key="index"
            class="express-item"
          >
            <div class="express-header">
              <span>快递单号：{{ express.trackingNumber }}</span>
              <span :class="['status', express.status]">{{
                getStatusText(express.status)
              }}</span>
            </div>

            <div class="express-content">
              <div class="express-info">
                <p><strong>快递公司：</strong>{{ express.courier }}</p>
                <p><strong>发货时间：</strong>{{ express.sendTime }}</p>
                <p><strong>收地址：</strong>{{ express.address }}</p>
              </div>

              <div class="tracking-info">
                <div
                  v-for="(track, tIndex) in express.tracking"
                  :key="tIndex"
                  class="tracking-item"
                  :class="{ active: tIndex === 0 }"
                >
                  <div class="time">{{ track.time }}</div>
                  <div class="info">{{ track.info }}</div>
                </div>
              </div>
            </div>

            <div class="express-actions">
              <button
                class="btn btn-outline btn-sm"
                @click="copyTrackingNumber(express.trackingNumber)"
              >
                复制单号
              </button>
              <button
                class="btn btn-primary btn-sm"
                @click="showDetailedTracking(express)"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-express">
          <p>暂无快递信息</p>
        </div>
      </div>
    </div>
  </div>

  <myFooter></myFooter>
</template>
  
  <script setup>
import myFooter from "../myFooter.vue";
import { useLoginStore } from "../../nweStore/logins";
import { useUserHub } from "../../nweStore/UserHub"; // 个人中心数据
import { ref, onMounted, onUpdated, reactive, computed, watch } from "vue";

const loginStore = useLoginStore();
const UserHub = useUserHub();
const fileInput = ref(null);
const avatarUrl = ref(UserHub.UserHub[0]?.avatar_url || ""); // Changed this line to use UserHub avatar
const showSettingsModal = ref(false);
const isEditing = ref(false);
const userSettings = reactive({
  name: "",
  password: "",
  email: "",
});

const showAddressModal = ref(false);
const isAddingAddress = ref(false);
const addresses = ref([]);
const currentAddress = reactive({
  name: "",
  phone: "",
  province: "",
  city: "",
  district: "",
  detail: "",
});

const showUnpaidModal = ref(false);
const unpaidOrders = ref([
  {
    orderNumber: "ORDER20240101001",
    createTime: "2024-01-01 12:00:00",
    products: [
      {
        name: "示例商品1",
        price: 99.99,
        quantity: 1,
        image: "http://127.0.0.1:3000/yang/img/img/logo.png",
      },
      // 可以添加更多商品
    ],
    totalAmount: 99.99,
  },
  // 可以添加更多订单
]);

const showPendingShipModal = ref(false);
const showShippingModal = ref(false);
const pendingShipOrders = ref([
  {
    orderNumber: "ORDER20240101002",
    createTime: "2024-01-01 14:00:00",
    payTime: "2024-01-01 14:05:00",
    address: "", // 初始为空，后面会动态设置
    products: [
      {
        name: "待发货商品1",
        price: 199.99,
        quantity: 1,
        image: "http://127.0.0.1:3000/yang/img/img/logo.png",
      },
    ],
  },
]);

const shippingOrders = ref([
  {
    orderNumber: "ORDER20240101003",
    createTime: "2024-01-01 15:00:00",
    shipTime: "2024-01-01 16:00:00",
    address: "", // 初始为空，后面会动态设置
    trackingInfo: "包裹已到达【上海转运中心】",
    products: [
      {
        name: "待收货商品1",
        price: 299.99,
        quantity: 1,
        image: "http://127.0.0.1:3000/yang/img/img/logo.png",
      },
    ],
  },
]);

const showReviewModal = ref(false);
const pendingReviews = ref([
  {
    orderNumber: "ORDER20240101004",
    createTime: "2024-01-01 17:00:00",
    rating: 0,
    reviewContent: "",
    products: [
      {
        name: "待评价商品1",
        price: 399.99,
        quantity: 1,
        image: "http://127.0.0.1:3000/yang/img/img/logo.png",
      },
    ],
  },
]);

const showRefundModal = ref(false);
const refundOrders = ref([
  {
    orderNumber: "ORDER20240101005",
    createTime: "2024-01-01 18:00:00",
    serviceType: "",
    reason: "",
    description: "",
    images: [],
    products: [
      {
        name: "申请退款商品1",
        price: 499.99,
        quantity: 1,
        image: "http://127.0.0.1:3000/yang/img/img/logo.png",
      },
    ],
  },
]);

const showAssetsModal = ref(false);
const showPickupModal = ref(false);
const pickupOrderNumber = ref("");
const hasSearched = ref(false);
const pickupOrders = ref([
  {
    orderNumber: "PKP20240101001",
    createTime: "2024-01-01 10:00:00",
    pickupCode: "A1B2C3",
    pickupAddress: "", // 初始为空，后面会动态设置
    courier: "顺丰速运",
    validUntil: "2024-01-03 23:59:59",
  },
]);

// 模拟数据
const redPackets = ref([
  {
    amount: 10,
    name: "新人红包",
    validUntil: "2024-12-31",
    condition: "无使用门槛",
  },
  {
    amount: 20,
    name: "生日红包",
    validUntil: "2024-12-31",
    condition: "满200可用",
  },
]);

const coupons = ref([
  {
    discount: "满100减10",
    name: "通用优惠券",
    validUntil: "2024-12-31",
    condition: "全场通用",
  },
  {
    discount: "满200减30",
    name: "品类优惠券",
    validUntil: "2024-12-31",
    condition: "仅限生鲜类商品",
  },
]);

const coins = ref({
  balance: 1000,
  history: [],
});

const activities = ref([
  {
    name: "双十二狂欢节",
    description: "全场商品低至5折起",
    timeRange: "2024-12-12 00:00 - 2024-12-12 23:59",
    image: "http://127.0.0.1:3000/yang/img/img/logo.png",
  },
  {
    name: "新年送好礼",
    description: "下单即送新年礼包",
    timeRange: "2024-01-01 00:00 - 2024-01-07 23:59",
    image: "http://127.0.0.1:3000/yang/img/img/logo.png",
  },
]);

const showExpressModal = ref(false);
const expressStatus = ref("all");
const expressDeliveries = ref([
  {
    trackingNumber: "SF1234567890",
    courier: "顺丰速运",
    status: "shipping",
    sendTime: "2024-01-01 10:00:00",
    address: "", // 将从用户地址中获取
    tracking: [
      {
        time: "2024-01-01 15:30:00",
        info: "【北京市】快件已到达【北京转运中心】",
      },
      {
        time: "2024-01-01 12:00:00",
        info: "【上海市】快件已从【上海集散中心】发出",
      },
      {
        time: "2024-01-01 10:00:00",
        info: "【上海市】快件已被揽收",
      },
    ],
  },
  // 可以添加更多快递记录
]);

// 计算筛选后的快递列表
const filteredExpress = computed(() => {
  if (expressStatus.value === "all") {
    return expressDeliveries.value;
  }
  return expressDeliveries.value.filter(
    (express) => express.status === expressStatus.value
  );
});

// 直接保留监听逻辑
watch(() => UserHub.UserHub[0]?.avatar_url, (newVal) => {
  if (newVal) {
    avatarUrl.value = newVal;
  }
});

//  onMounted 钩子
onMounted(async () => {
  await UserHub.getUserHub();
  // console.log('完整的 UserHub 数据:', UserHub.UserHub);
  // console.log('头像 URL:', UserHub.UserHub[0]?.avatar_url);
  // console.log('avatarUrl ref:', avatarUrl.value);
  
  // 设置头像
  if (UserHub.UserHub[0]?.avatar_url) {
    avatarUrl.value = UserHub.UserHub[0].avatar_url;
    console.log('设置的头像URL:', avatarUrl.value); // 添加调试日志
  }

  // Get saved addresses and update orders
  const savedAddresses = localStorage.getItem("userAddresses");
  if (savedAddresses) {
    addresses.value = JSON.parse(savedAddresses);
    updateAllOrderAddresses();
  }
});

onUpdated(() => {
  console.log(UserHub.UserHub[0].balance);
})




// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith("image/")) {
    alert("请选择图片文件！");
    return;
  }

  // 验证文件大小（例如最 2MB）
  if (file.size > 2 * 1024 * 1024) {
    alert("图片大小不能超过 2MB！");
    return;
  }

  // 创建本地预览
  const reader = new FileReader();
  reader.onload = (e) => {
    const newAvatarUrl = e.target.result;
    avatarUrl.value = newAvatarUrl;
    
  };
  reader.readAsDataURL(file);

  // 上传到服务器
  uploadAvatar(file);
};

// 上传头像到服务器
const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", loginStore.Loginuser.id); // 添加用户ID

    const response = await fetch("/api/yang/upload/avatar", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("上传失败");
    }

    const data = await response.json();
    if (data.code === 200) {
      console.log("头像上传成功:", data);
      // 如果服务器返回新URL，更新它
      if (data.avatarUrl) {
        loginStore.updateAvatar(data.avatarUrl);
        // 刷新页面
        window.location.reload();
      }
    } else {
      throw new Error(data.message || "上传失败");
    }
  } catch (error) {
    console.error("头像上传失败:", error);
  }
};

// 打开模态框并初始化数据
const openModal = () => {
  userSettings.name = loginStore.Loginuser.name || "";
  userSettings.password = loginStore.Loginuser.password || "";
  userSettings.email = loginStore.Loginuser.email || "";
  showSettingsModal.value = true;
  isEditing.value = false;
};

const closeModal = () => {
  showSettingsModal.value = false;
  isEditing.value = false;
};

const toggleEdit = async () => {
  if (isEditing.value) {
    // 表单验证
    if (!userSettings.name.trim()) {
      alert("用户名不能为���");
      return;
    }
    if (!userSettings.password.trim()) {
      alert("密码不能为空");
      return;
    }
    if (userSettings.email && !validateEmail(userSettings.email)) {
      alert("邮箱格式不正确");
      return;
    }

    try {
      // 使用 store 的方法更新用户信息
      const result = await loginStore.updateUserInfo({
        id: loginStore.Loginuser.id,
        name: userSettings.name.trim(),
        password: userSettings.password,
        email: userSettings.email.trim(),
      });

      if (result.success) {
        alert("保存成功");
        isEditing.value = false;
        showSettingsModal.value = false; // 关闭蒙层
        loginStore.getLoginuser(); // 刷新用户信息
      } else {
        alert(result.message || "保存失败，请重试");
      }
    } catch (error) {
      console.error("保存失败:", error);
      alert("网络错误，请重试");
    }
  } else {
    isEditing.value = true;
  }
};

// 邮箱验证函数
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// 打开地址模态框
const openAddressModal = () => {
  showAddressModal.value = true;
  // 从本地存储或服务器获取地址列表
  const savedAddresses = localStorage.getItem("userAddresses");
  if (savedAddresses) {
    addresses.value = JSON.parse(savedAddresses);
  }
};

// 关闭地址模态框
const closeAddressModal = () => {
  showAddressModal.value = false;
  isAddingAddress.value = false;
};

// 开始添加新地址
const startAddAddress = () => {
  isAddingAddress.value = true;
  Object.keys(currentAddress).forEach((key) => {
    currentAddress[key] = "";
  });
};

// 编辑地址
const editAddress = (index) => {
  const address = addresses.value[index];
  Object.keys(currentAddress).forEach((key) => {
    currentAddress[key] = address[key];
  });
  isAddingAddress.value = true;
};

// 删除地址
const deleteAddress = (index) => {
  if (confirm("确定要删除这个地址吗？")) {
    addresses.value.splice(index, 1);
    // 保存到本地存储
    localStorage.setItem("userAddresses", JSON.stringify(addresses.value));
    // 更新所有相关订单的地址信息
    updateAllOrderAddresses();
  }
};

// 保存地址
const saveAddress = () => {
  // 表单验证
  if (!currentAddress.name.trim()) {
    alert("请输入收货人姓名");
    return;
  }
  if (!currentAddress.phone.trim()) {
    alert("请输入手机号码");
    return;
  }
  if (
    !currentAddress.province ||
    !currentAddress.city ||
    !currentAddress.district
  ) {
    alert("请选择完整的地区信息");
    return;
  }
  if (!currentAddress.detail.trim()) {
    alert("请输入详细地址");
    return;
  }

  // 添加新地址到列表
  addresses.value.push({ ...currentAddress });
  // 保存到本地存储
  localStorage.setItem("userAddresses", JSON.stringify(addresses.value));

  // 更新所有相关订单的地址信息
  updateAllOrderAddresses();

  // 重置表单并关闭添加界面
  isAddingAddress.value = false;
};

// 取消添加地址
const cancelAddAddress = () => {
  isAddingAddress.value = false;
};

// 显示待付款订单
const showUnpaidOrders = () => {
  showUnpaidModal.value = true;
  // TODO: 从后端获取待付款订单数据
  // fetchUnpaidOrders();
};

// 关闭待付款订单模态框
const closeUnpaidModal = () => {
  showUnpaidModal.value = false;
};

// 支付订单
const payOrder = (order) => {
  // TODO: 实现支付逻辑
  console.log("支付订单:", order);
};

// 取消订单
const cancelOrder = (order, index) => {
  if (confirm("确定要取消这个订单吗？")) {
    // TODO: 调用后端API取消订单
    unpaidOrders.value.splice(index, 1);
    console.log("取消订单:", order);
  }
};

// 显示待发货订单
const showPendingShipOrders = () => {
  showPendingShipModal.value = true;
};

// 关闭待发货模态框
const closePendingShipModal = () => {
  showPendingShipModal.value = false;
};

// 显示待收货订单
const showShippingOrders = () => {
  showShippingModal.value = true;
};

// 关闭待收货模态框
const closeShippingModal = () => {
  showShippingModal.value = false;
};

// 显示待评价订单
const showPendingReviews = () => {
  showReviewModal.value = true;
};

// 关闭待评价模态框
const closeReviewModal = () => {
  showReviewModal.value = false;
};

// 设置评分
const setRating = (order, rating) => {
  order.rating = rating;
};

// 提交评价
const submitReview = async (order, index) => {
  // 表单验证
  if (order.rating === 0) {
    alert("请选择评分");
    return;
  }
  if (!order.reviewContent.trim()) {
    alert("请输入评价内容");
    return;
  }

  try {
    // 调用后端API提交评价
    const response = await fetch(
      "http://127.0.0.1:3000/api/submit-review",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.orderNumber,
          userId: loginStore.Loginuser.id,
          rating: order.rating,
          content: order.reviewContent.trim(),
        }),
      }
    );

    const data = await response.json();
    if (data.code === 200) {
      alert("评价提交成功���感谢您的反馈！");
      // 从待评价列表中移除该订单
      pendingReviews.value.splice(index, 1);
      // 如果没有待评价订单了，关闭模态框
      if (pendingReviews.value.length === 0) {
        closeReviewModal();
      }
    } else {
      throw new Error(data.message || "评价提交失败");
    }
  } catch (error) {
    console.error("评价提交失败:", error);
    alert(error.message || "评价提交失败，请重试");
  }
};

// 修改待发货和待收货订单的地址显示逻辑
const formatAddress = (address) => {
  return `${address.province}${address.city}${address.district}${address.detail}`;
};

// 获取默认地址或第一个地址
const getDefaultAddress = () => {
  if (addresses.value && addresses.value.length > 0) {
    // 如果有默认地址，返回默认地址，否则返回第一个地址
    return addresses.value[0];
  }
  return null;
};

// 更新所有相关订单的地址信息
const updateAllOrderAddresses = () => {
  const defaultAddress = getDefaultAddress();
  if (defaultAddress) {
    const formattedAddress = formatAddress(defaultAddress);

    // 更新待发货订单的地址
    pendingShipOrders.value = pendingShipOrders.value.map((order) => ({
      ...order,
      address: formattedAddress,
    }));

    // 更新待收货订单的地址
    shippingOrders.value = shippingOrders.value.map((order) => ({
      ...order,
      address: formattedAddress,
    }));

    // 更新取件订单的地址
    pickupOrders.value = pickupOrders.value.map((order) => ({
      ...order,
      pickupAddress: formattedAddress,
    }));

    // 可以在这里添加其他需要更新地址的订单类型
  }
};

// 确认收货
const confirmReceive = async (order, index) => {
  if (confirm("确认已收到商品了？确认后无法撤销。")) {
    try {
      // TODO: 调用后端API确认收货
      const response = await fetch(
        "http://127.0.0.1:3000/api/confirm-receipt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.orderNumber,
            userId: loginStore.Loginuser.id,
          }),
        }
      );

      const data = await response.json();
      if (data.code === 200) {
        alert("确认收货成功！感谢您的购买！");
        // 从待收货列表中移除该订单
        shippingOrders.value.splice(index, 1);
        // 如果没有待收货订单了，关闭模态框
        if (shippingOrders.value.length === 0) {
          closeShippingModal();
        }
      } else {
        throw new Error(data.message || "确认收货失败");
      }
    } catch (error) {
      console.error("确认收货失败:", error);
      alert(error.message || "确认收货失败，请重试");
    }
  }
};

// 显示退款/售后模态框
const showRefundService = () => {
  showRefundModal.value = true;
};

// 关闭退款/售后模态框
const closeRefundModal = () => {
  showRefundModal.value = false;
};

// 处理图片上传
const handleImageUpload = (event, order) => {
  const files = event.target.files;
  if (!files) return;

  // 限制上传图片数量
  if (order.images.length + files.length > 5) {
    alert("最多上传5张图片");
    return;
  }

  Array.from(files).forEach((file) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      order.images.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

// 移除已上传的图片
const removeImage = (order, index) => {
  if (confirm("确定要删除这张图片吗？")) {
    order.images.splice(index, 1);
  }
};

// 提交退款/售后申请
const submitRefund = async (order, index) => {
  // 表单验证
  if (!order.serviceType) {
    alert("请选择服务类型");
    return;
  }
  if (!order.reason) {
    alert("请选择申请原因");
    return;
  }
  if (!order.description.trim()) {
    alert("请描述问题");
    return;
  }

  try {
    // 调用后端API提交申请
    const response = await fetch(
      "http://127.0.0.1:3000/api/submit-refund",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.orderNumber,
          userId: loginStore.Loginuser.id,
          serviceType: order.serviceType,
          reason: order.reason,
          description: order.description.trim(),
          images: order.images,
        }),
      }
    );

    const data = await response.json();
    if (data.code === 200) {
      alert("申请提交成功！客服会尽快处理您的请求");
      // 从列表中移除该订单
      refundOrders.value.splice(index, 1);
      // 如果没有可申请的订单了，关闭模态框
      if (refundOrders.value.length === 0) {
        closeRefundModal();
      }
    } else {
      throw new Error(data.message || "申请提交失败");
    }
  } catch (error) {
    console.error("申请提交失败:", error);
    alert(error.message || "申请提交失败，请重试");
  }
};

// 显示资产详情
const showMoreAssets = () => {
  showAssetsModal.value = true;
};

// 关闭资产详情
const closeAssetsModal = () => {
  showAssetsModal.value = false;
};

// 查看金币明细
const showCoinsHistory = () => {
  // TODO: 实现金币明细查看功能
  console.log("查看金币明细");
};

// 金币兑换
const exchangeCoins = () => {
  // TODO: 实现金币兑换功能
  console.log("金币兑换");
};

// 参与活动
const joinActivity = (activity) => {
  // TODO: 实现活动参与功能
  console.log("参与活动:", activity);
};

// 显示查取件模态框
const showPickupCode = () => {
  showPickupModal.value = true;
  hasSearched.value = false;
  pickupOrderNumber.value = "";
};

// 关闭查取件模态框
const closePickupModal = () => {
  showPickupModal.value = false;
};

// 搜索取件码
const searchPickupCode = async () => {
  if (!pickupOrderNumber.value.trim()) {
    alert("请输入订单号");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:3000/api/pickup-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderNumber: pickupOrderNumber.value.trim(),
        userId: loginStore.Loginuser.id,
      }),
    });

    const data = await response.json();
    if (data.code === 200) {
      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        const formattedAddress = formatAddress(defaultAddress);
        // 更新取件订单的地址
        pickupOrders.value = data.orders.map((order) => ({
          ...order,
          pickupAddress: formattedAddress,
        }));
      } else {
        pickupOrders.value = data.orders;
      }
    } else {
      pickupOrders.value = [];
    }
    hasSearched.value = true;
  } catch (error) {
    console.error("查��取件码失败:", error);
    alert("查询失败，请重试");
  }
};

// 复制取件码
const copyCode = (code) => {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      alert("取件码已复制到剪贴板");
    })
    .catch(() => {
      alert("复制失���，请手动复���");
    });
};

// 显示取件二维码
const showQRCode = (order) => {
  // TODO: 实现二维码显示逻辑
  alert(`显示订单 ${order.orderNumber} 的取件二维码`);
};

// 显示快递模态框
const showExpressDelivery = () => {
  showExpressModal.value = true;
  // 更新快递地址
  updateExpressAddresses();
};

// 关闭快递模态框
const closeExpressModal = () => {
  showExpressModal.value = false;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    shipping: "运输中",
    delivered: "已送达",
    received: "已签收",
  };
  return statusMap[status] || status;
};

// 复制快递单号
const copyTrackingNumber = (number) => {
  navigator.clipboard
    .writeText(number)
    .then(() => {
      alert("快递单号已复制到剪贴板");
    })
    .catch(() => {
      alert("复制失败，请手动复制");
    });
};

// 查看详���物流信息
const showDetailedTracking = (express) => {
  // TODO: 实现查看详细物流信息的逻辑
  console.log("查看详细物流信息:", express);
};

// 更新快递地址
const updateExpressAddresses = () => {
  const defaultAddress = getDefaultAddress();
  if (defaultAddress) {
    const formattedAddress = formatAddress(defaultAddress);
    expressDeliveries.value = expressDeliveries.value.map((express) => ({
      ...express,
      address: formattedAddress,
    }));
  }
};
</script>
  
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background-color: #f0f2f5;
  color: #333;
  line-height: 1.6;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
header {
  background-color: #8acd58;
  color: white;
  padding: 1rem 0;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}
.header-content h1 {
  font-size: 24px;
  margin: 0;
}
/* .logo img {
  height: 40px;
} */
main {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}
aside {
  width: 25%;
}
.main-content {
  flex: 1;
}
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}
.card-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.card-title {
  font-size: 1.2rem;
  font-weight: bold;
}
.card-content {
  padding: 1rem;
}
.grid {
  display: grid;
  gap: 1rem;
}
.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}
.grid-5 {
  grid-template-columns: repeat(5, 1fr);
}
.text-center {
  text-align: center;
}
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #ff4d4f;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.btn:hover {
  background-color: #ff7875;
}
.btn-outline {
  background-color: transparent;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}
.btn-outline:hover {
  background-color: #ff4d4f;
  color: white;
}
.logo img {
  width: 100px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-info {
  flex: 1;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.empty-address {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.area-select {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.area-select input {
  width: 100%;
}

.unpaid-orders {
  max-height: 70vh;
  overflow-y: auto;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  color: #666;
  font-size: 0.9rem;
}

.product-list {
  padding: 1rem 0;
}

.product-item {
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f5f5f5;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
}

.product-info {
  flex: 1;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
}

.product-price {
  color: #ff4d4f;
  font-weight: bold;
}

.product-quantity {
  color: #666;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.order-total {
  font-size: 1.1rem;
}

.order-total .price {
  color: #ff4d4f;
  font-weight: bold;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-orders {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.shipping-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.shipping-info p {
  margin: 0.5rem 0;
  color: #666;
}

.review-section {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.rating {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.stars {
  display: flex;
  margin-left: 0.5rem;
}

.star {
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.star.active {
  opacity: 1;
}

.review-content {
  margin-bottom: 1rem;
}

.review-content textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.refund-section {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.image-preview {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.preview-image:hover {
  opacity: 0.8;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.assets-details {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 1rem;
}

.asset-section {
  margin-bottom: 2rem;
}

.asset-section h3 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.coupon-list {
  display: grid;
  gap: 1rem;
}

.coupon-item {
  display: flex;
  background: linear-gradient(
    45deg,
    #8acd58 0%,
    #a8db88 100%
  ); /* 改为绿色渐变 */
  color: white;
  padding: 1rem;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.coupon-amount {
  font-size: 1.5rem;
  font-weight: bold;
  padding-right: 1rem;
  border-right: 1px dashed rgba(255, 255, 255, 0.3);
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.coupon-validity,
.coupon-condition {
  font-size: 0.875rem;
  opacity: 0.8;
}

.coins-info {
  background-color: #fffbe6;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 2rem;
}

.coins-balance {
  text-align: center;
}

.coins-amount {
  font-size: 2rem;
  color: #8acd58; /* 改为绿色 */
  font-weight: bold;
}

.coins-label {
  color: #666;
}

.coins-details {
  flex: 1;
}

.coins-details ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.coins-details li {
  margin-bottom: 0.5rem;
  color: #666;
}

.coins-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.activity-list {
  display: grid;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

.activity-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.activity-info {
  flex: 1;
}

.activity-time {
  color: #666;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.pickup-search {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.pickup-list {
  max-height: 60vh;
  overflow-y: auto;
}

.pickup-item {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
}

.pickup-code {
  text-align: center;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.code-display {
  font-size: 2rem;
  font-weight: bold;
  color: #1890ff;
  margin: 0.5rem 0;
  letter-spacing: 4px;
}

.pickup-details {
  margin: 1rem 0;
}

.pickup-details p {
  margin: 0.5rem 0;
  color: #666;
}

.pickup-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.empty-pickup {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.express-filter {
  margin-bottom: 1rem;
}

.express-list {
  max-height: 70vh;
  overflow-y: auto;
}

.express-item {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
}

.express-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status.shipping {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status.delivered {
  background-color: #f6ffed;
  color: #52c41a;
}

.status.received {
  background-color: #f5f5f5;
  color: #666;
}

.express-info {
  margin-bottom: 1rem;
}

.tracking-info {
  border-left: 2px solid #eee;
  padding-left: 1rem;
  margin-left: 0.5rem;
}

.tracking-item {
  position: relative;
  padding-bottom: 1rem;
  color: #666;
}

.tracking-item::before {
  content: "";
  position: absolute;
  left: -1.25rem;
  top: 0.25rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #eee;
}

.tracking-item.active {
  color: #1890ff;
}

.tracking-item.active::before {
  background-color: #1890ff;
}

.time {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.express-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.empty-express {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.quick-functions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  padding: 10px;
}

.quick-function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.quick-function-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(138, 205, 88, 0.1);
  border-color: #8acd58;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fff4, #eefbe6);
  border-radius: 50%;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.quick-function-item:hover .icon-wrapper {
  background: linear-gradient(135deg, #eefbe6, #e4f8d7);
  transform: scale(1.1);
}

.quick-icon {
  font-size: 28px;
}

.quick-label {
  color: #333;
  font-size: 15px;
  margin-top: 8px;
  transition: color 0.3s ease;
}

.quick-function-item:hover .quick-label {
  color: #8acd58;
}

/* 响应式布局调整 */
@media screen and (max-width: 768px) {
  .quick-functions {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .quick-function-item {
    padding: 15px;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
  }

  .quick-icon {
    font-size: 24px;
  }
}

@media screen and (max-width: 480px) {
  .quick-functions {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar {
  border: 1px solid #eee;
  border-radius: 50%;
  overflow: hidden;
}
</style>